export function generateFinalSchedule(proj) {
  const classes = proj.classes || [];
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const validTimeSlots = (proj.timeSlots || []).filter(s => s.from && s.to);
  const timeSlots =
    validTimeSlots.length > 0
      ? validTimeSlots
      : [
          { from: "09:15", to: "10:15", type: "LEC" },
          { from: "10:15", to: "11:15", type: "LEC" },
          { from: "11:15", to: "11:30", type: "RECESS" },
          { from: "11:30", to: "12:30", type: "prac" },
          { from: "12:30", to: "01:30", type: "prac" },
          { from: "01:30", to: "02:15", type: "LUNCH" },
          { from: "02:15", to: "03:15", type: "LEC" },
          { from: "03:15", to: "04:15", type: "LEC" },
        ];

  const projectSessionTypes = proj.sessionTypes || {
    lectureDuration: 1,
    tutorialDuration: 1,
    practicalDuration: 2,
  };

  const classStates = classes.map((cls) => ({
    ...cls,
    subjects: (cls.subjects || []).map((s) => ({
      ...s,
      lecLeft: parseInt(s.lecturesPerWeek) || 0,
      pracLeft: parseFloat(s.practicalsPerWeek) || 0,
      tutorialLeft: parseInt(s.tutorialsPerWeek) || 0,
    })),
    schedule: {},
    extraPending: [],
    _lastFirstLectureName: cls._lastFirstLectureName || null,
  }));

  const teacherBusySlots = {};
  const labBusySlots = {};

  // helper: check if a range of slots are free for a teacher and/or lab
  function slotsFree(day, startIdx, duration, teacherId, labId) {
    for (let offset = 0; offset < duration; offset++) {
      const idx = startIdx + offset;
      const slot = timeSlots[idx];
      if (!slot || slot.type === "RECESS" || slot.type === "LUNCH")
        return false;
      if (teacherId && teacherBusySlots[`${day}-${idx}-${teacherId}`])
        return false;
      if (labId && labBusySlots[`${day}-${idx}-${labId}`]) return false;
    }
    return true;
  }

  days.forEach((day, dayIdx) => {
    const subjectDoneTodayPerClass = {};
    const practicalDoneTodayPerClass = {};

    timeSlots.forEach((slot, sIdx) => {
      if (slot.type === "RECESS" || slot.type === "LUNCH") return;

      // We'll attempt practicals at candidate start indices where enough slots exist
      // For compatibility with earlier behavior, prefer the earlier mid-day index if present
      let candidatePracStarts = [];
      timeSlots.forEach((s, i) => {
        if (s.type && s.type.toUpperCase() === "PRAC") candidatePracStarts.push(i);
      });
      if (candidatePracStarts.length === 0) {
        // Use a randomized list of potential start slots to "alternate" sessions
        candidatePracStarts = [3, 0, 1, 2, 4, 6].sort(() => Math.random() - 0.5);
      } else {
        // Even if slots are marked as PRAC, shuffle their order of attempt
        candidatePracStarts = [...candidatePracStarts].sort(() => Math.random() - 0.5);
      }

      // Practical allocation pass
      for (let cls of [...classStates].sort(() => Math.random() - 0.5)) {
        if (practicalDoneTodayPerClass[cls._id]) continue;
        if (day === "Saturday" && cls.saturdayProject) continue;

        // determine practical duration per batch later when assigning
        // 1) sameAllSubs: single subject for all batches
        const sameAllSubs = (cls.subjects || []).filter(
          (s) => s.pracLeft > 0 && s.sameBatchPractical,
        );
        if (sameAllSubs.length > 0) {
          const sub = sameAllSubs[0];
          // prefer teacher's cabin lab if available
          const tId = sub.assignedTeachers?.practicalTeacher;
          const teacherObj = proj.teachers?.find(
            (t) => String(t._id) === String(tId),
          );
          const preferredLab =
            teacherObj?.locationLabId ||
            sub.labRoom ||
            (cls.batches && cls.batches[0] && cls.batches[0].labId);
          // pick a start slot that has enough consecutive slots according to practicalDuration
          for (const startIdx of candidatePracStarts) {
            let duration = projectSessionTypes.practicalDuration || 2;
            if (timeSlots[startIdx] && timeSlots[startIdx].type && timeSlots[startIdx].type.toUpperCase() === "PRAC") {
              let count = 0;
              for (let k = startIdx; k < timeSlots.length; k++) {
                if (timeSlots[k].type && timeSlots[k].type.toUpperCase() === "PRAC") count++;
                else break;
              }
              duration = count;
            }
            const nextSlot = timeSlots[startIdx + duration - 1];
            if (!nextSlot) continue;
            if (!slotsFree(day, startIdx, duration, tId, preferredLab))
              continue;
            // assign
            const batchAssignments = (cls.batches || []).map((batch) => ({
              batchName: batch.batchName,
              subjectName: sub.subjectName,
              teacher: tId,
              subRef: sub,
              labId: preferredLab,
            }));
            batchAssignments.forEach((item) => {
              for (let off = 0; off < duration; off++) {
                teacherBusySlots[`${day}-${startIdx + off}-${item.teacher}`] =
                  true;
                if (item.labId)
                  labBusySlots[`${day}-${startIdx + off}-${item.labId}`] = true;
              }
            });
            sub.pracLeft -= 1;
            cls.schedule[day] = cls.schedule[day] || [];
            cls.schedule[day][startIdx] = {
              type: "P",
              isFirst: true,
              batchAssignment: batchAssignments,
            };
            for (let off = 1; off < duration; off++)
              cls.schedule[day][startIdx + off] = { type: "P", isFirst: false };
            practicalDoneTodayPerClass[cls._id] = true;
            break;
          }
          if (practicalDoneTodayPerClass[cls._id]) continue;
        }

        // 2) per-batch greedy assignment: fill the "practical block" for each batch
        // A block typically lasts 'practicalDuration' slots. 
        // We try to fill each batch's slots in this block with either a Practical or Tutorials.
        for (const startIdx of candidatePracStarts) {
          const blockDuration = projectSessionTypes.practicalDuration || 2;
          const batchAssignments = []; // entries: { batchName, subjectName, teacher, labId, duration, offset, type }
          
          // Randomize batch order to avoid bias
          const shuffledBatchIndices = (cls.batches || []).map((_, i) => i).sort(() => Math.random() - 0.5);

          for (const bIdx of shuffledBatchIndices) {
            const batch = cls.batches[bIdx];
            let slotsFilledInBlock = 0;

            while (slotsFilledInBlock < blockDuration) {
              const currentOffset = slotsFilledInBlock;
              const currentSlotIdx = startIdx + currentOffset;
              if (currentSlotIdx >= timeSlots.length) break;

              let assigned = null;

              // A) Try Practical (randomized subject order)
              const remainingInBlock = blockDuration - currentOffset;
              if (remainingInBlock >= (projectSessionTypes.practicalDuration || 2)) {
                const practicalSubs = (cls.subjects || [])
                  .filter(s => s.pracLeft > 0)
                  .sort(() => Math.random() - 0.5); // Shuffle subjects

                for (const sub of practicalSubs) {
                  let tId = sub.assignedTeachers?.practicalTeacher;
                  let labId = sub.labRoom;
                  if (sub.practicalTeachers) {
                    const mapEntry = sub.practicalTeachers.find(p => p.batchIndex === bIdx);
                    if (mapEntry) {
                      if (mapEntry.teacherId) tId = mapEntry.teacherId;
                      if (mapEntry.labId) labId = mapEntry.labId;
                    }
                  }
                  if (!tId) continue; // Must have a teacher

                  const teacherObj = proj.teachers?.find(t => String(t._id) === String(tId));
                  const preferredLab = labId || teacherObj?.locationLabId || sub.labRoom;
                  const dur = projectSessionTypes.practicalDuration || 2;

                  if (slotsFree(day, currentSlotIdx, dur, tId, preferredLab)) {
                    assigned = {
                      batchName: batch.batchName,
                      subjectName: sub.subjectName,
                      teacher: tId,
                      subRef: sub,
                      labId: preferredLab,
                      duration: dur,
                      offset: currentOffset,
                      type: "P"
                    };
                    break;
                  }
                }
              }

              // B) Try Tutorial (1 slot) if no practical assigned (randomized subject order)
              if (!assigned) {
                const tutorialSubs = (cls.subjects || [])
                  .filter(s => s.tutorialLeft > 0)
                  .sort(() => Math.random() - 0.5); // Shuffle subjects

                for (const sub of tutorialSubs) {
                  let tId = sub.assignedTeachers?.tutorialTeacher;
                  let labId = sub.labRoom; 
                  if (sub.tutorialTeachers) {
                    const mapEntry = sub.tutorialTeachers.find(p => p.batchIndex === bIdx);
                    if (mapEntry) {
                      if (mapEntry.teacherId) tId = mapEntry.teacherId;
                      if (mapEntry.labId) labId = mapEntry.labId;
                    }
                  }
                  if (!tId) continue;

                  const teacherObj = proj.teachers?.find(t => String(t._id) === String(tId));
                  const preferredLab = labId || teacherObj?.locationLabId || sub.labRoom;
                  const dur = 1;

                  if (slotsFree(day, currentSlotIdx, dur, tId, preferredLab)) {
                    assigned = {
                      batchName: batch.batchName,
                      subjectName: sub.subjectName,
                      teacher: tId,
                      subRef: sub,
                      labId: preferredLab,
                      duration: dur,
                      offset: currentOffset,
                      type: "T"
                    };
                    break;
                  }
                }
              }

              if (assigned) {
                batchAssignments.push(assigned);
                slotsFilledInBlock += assigned.duration;
                // Immediate reservation within the block to prevent conflicts between batches of the SAME class in the SAME block
                for (let off = 0; off < assigned.duration; off++) {
                  const sIdx = startIdx + assigned.offset + off;
                  teacherBusySlots[`${day}-${sIdx}-${assigned.teacher}`] = true;
                  if (assigned.labId) labBusySlots[`${day}-${sIdx}-${assigned.labId}`] = true;
                }
                // Decrement left
                if (assigned.type === "P") {
                  assigned.subRef.pracLeft -= 1 / ((cls.batches || []).length || 1);
                } else {
                  assigned.subRef.tutorialLeft -= 1 / ((cls.batches || []).length || 1);
                }
              } else {
                slotsFilledInBlock += 1; // Skip this slot for this batch
              }
            }
          }

          if (batchAssignments.length > 0) {
            cls.schedule[day] = cls.schedule[day] || [];
            cls.schedule[day][startIdx] = {
              type: "P",
              isFirst: true,
              batchAssignment: batchAssignments,
            };
            for (let off = 1; off < blockDuration; off++) {
              if (startIdx + off < timeSlots.length) {
                cls.schedule[day][startIdx + off] = { type: "P", isFirst: false };
              }
            }
            practicalDoneTodayPerClass[cls._id] = true;
            break;
          }
        }
        if (practicalDoneTodayPerClass[cls._id]) continue;
      }

      // Tutorial & Lecture pass per original logic
      // SHUFFLE classes to ensure variety in every slot during shuffle
      [...classStates].sort(() => Math.random() - 0.5).forEach((cls) => {
        cls.schedule[day] = cls.schedule[day] || [];
        if (cls.schedule[day][sIdx] && cls.schedule[day][sIdx].type !== "FREE")
          return;

        const availableTutSubs = (cls.subjects || []).filter((s) => {
          const tId = s.assignedTeachers?.tutorialTeacher;
          const teacherObj = proj.teachers?.find(t => String(t._id) === String(tId));
          const labId = s.labRoom || teacherObj?.locationLabId;
          
          let free = tId && !teacherBusySlots[`${day}-${sIdx}-${tId}`];
          if (free && labId) {
            if (labBusySlots[`${day}-${sIdx}-${labId}`]) free = false;
          }
          
          return s.tutorialLeft > 0 && free;
        });

        if (availableTutSubs.length > 0) {
          // Add small randomness to sort for better shuffling
          availableTutSubs.sort((a, b) => (b.tutorialLeft - a.tutorialLeft) || (Math.random() - 0.5));
          const tutSub = availableTutSubs[0];
          const tId = tutSub.assignedTeachers.tutorialTeacher;
          const teacherObj = proj.teachers?.find(t => String(t._id) === String(tId));
          const labId = tutSub.labRoom || teacherObj?.locationLabId;

          teacherBusySlots[`${day}-${sIdx}-${tId}`] = true;
          if (labId) labBusySlots[`${day}-${sIdx}-${labId}`] = true;

          subjectDoneTodayPerClass[`${cls._id}-${tutSub.subjectName}`] = true;
          tutSub.tutorialLeft -= 1;
          cls.schedule[day][sIdx] = { type: "T", subject: tutSub, labId: labId };
          return;
        }

        // Lecture assignment
        const availableLecSubs = (cls.subjects || []).filter((s) => {
          const tId = s.assignedTeachers?.lectureTeacher;
          return (
            s.lecLeft > 0 &&
            tId && 
            !teacherBusySlots[`${day}-${sIdx}-${tId}`]
          );
        });

        if (availableLecSubs.length > 0) {
          let sorted = availableLecSubs.slice();
          if (sIdx === 0 && cls._lastFirstLectureName) {
            sorted.sort((a, b) => {
              const aIsLast =
                a.subjectName === cls._lastFirstLectureName ? 1 : 0;
              const bIsLast =
                b.subjectName === cls._lastFirstLectureName ? 1 : 0;
              if (aIsLast !== bIsLast) return aIsLast - bIsLast;
              return (b.lecLeft - a.lecLeft) || (Math.random() - 0.5);
            });
          } else sorted.sort((a, b) => (b.lecLeft - a.lecLeft) || (Math.random() - 0.5));

          const lecSub = sorted[0];
          const tId = lecSub.assignedTeachers.lectureTeacher;
          teacherBusySlots[`${day}-${sIdx}-${tId}`] = true;
          subjectDoneTodayPerClass[`${cls._id}-${lecSub.subjectName}`] = true;
          lecSub.lecLeft -= 1;
          cls.schedule[day][sIdx] = { type: "L", subject: lecSub };
          if (sIdx === 0) cls._lastFirstLectureName = lecSub.subjectName;
        } else {
          cls.schedule[day][sIdx] = null;
        }
      });
    });
  });

  classStates.forEach((cls) => {
    (cls.subjects || []).forEach((s) => {
      if (s.lecLeft > 0)
        cls.extraPending.push(`${s.subjectName} (${s.lecLeft} Lec)`);
      if (s.pracLeft > 0.1) cls.extraPending.push(`${s.subjectName} (Prac)`);
      if (s.tutorialLeft > 0) cls.extraPending.push(`${s.subjectName} (Tut)`);
    });
  });

  return classStates;
}

export function computeScore(candidate, proj) {
  const timeSlots =
    proj.timeSlots && proj.timeSlots.length ? proj.timeSlots : [];
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let unassigned = 0;
  const teacherSlotCounts = {};
  const labSlotCounts = {};
  const hallSlotCounts = {};
  const teacherTotalSlots = {};
  candidate.forEach((cls) => {
    if (cls.extraPending) unassigned += cls.extraPending.length;
    const schedule = cls.schedule || {};
    days.forEach((day) => {
      const daySched = schedule[day] || [];
      daySched.forEach((cell, sIdx) => {
        if (!cell) return;
        if (cell.type === "P" && cell.isFirst) {
          (cell.batchAssignment || []).forEach((ba) => {
            const t = ba.teacher;
            const lab = ba.labId;
            [sIdx, sIdx + 1].forEach((slotIdx) => {
              if (!t) return;
              const tk = `${day}-${slotIdx}-${t}`;
              teacherSlotCounts[tk] = (teacherSlotCounts[tk] || 0) + 1;
              teacherTotalSlots[t] = (teacherTotalSlots[t] || 0) + 1;
              if (lab) {
                const lk = `${day}-${slotIdx}-${lab}`;
                labSlotCounts[lk] = (labSlotCounts[lk] || 0) + 1;
              }
            });
          });
        } else if (cell.type === "L" || cell.type === "T") {
          const t =
            cell.subject?.assignedTeachers?.lectureTeacher ||
            cell.subject?.assignedTeachers?.tutorialTeacher;
          if (t) {
            const tk = `${day}-${sIdx}-${t}`;
            teacherSlotCounts[tk] = (teacherSlotCounts[tk] || 0) + 1;
            teacherTotalSlots[t] = (teacherTotalSlots[t] || 0) + 1;
          }
          // If it's a tutorial with a lab assigned, count lab usage
          if (cell.type === "T" && cell.labId) {
            const lk = `${day}-${sIdx}-${cell.labId}`;
            labSlotCounts[lk] = (labSlotCounts[lk] || 0) + 1;
          } else if (cls.lectureHallId) {
            const hk = `${day}-${sIdx}-${cls.lectureHallId}`;
            hallSlotCounts[hk] = (hallSlotCounts[hk] || 0) + 1;
          }
        }
      });
    });
  });
  let teacherConflicts = 0;
  Object.values(teacherSlotCounts).forEach((v) => {
    if (v > 1) teacherConflicts += v - 1;
  });
  let labConflicts = 0;
  Object.values(labSlotCounts).forEach((v) => {
    if (v > 1) labConflicts += v - 1;
  });
  let hallConflicts = 0;
  Object.values(hallSlotCounts).forEach((v) => {
    if (v > 1) hallConflicts += v - 1;
  });
  const loads = Object.values(teacherTotalSlots);
  let variance = 0;
  if (loads.length > 0) {
    const mean = loads.reduce((a, b) => a + b, 0) / loads.length;
    variance =
      loads.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / loads.length;
  }
  const score =
    unassigned * 100 +
    teacherConflicts * 20 +
    labConflicts * 15 +
    hallConflicts * 10 +
    Math.round(variance);
  return {
    score,
    breakdown: {
      unassigned,
      teacherConflicts,
      labConflicts,
      hallConflicts,
      variance,
    },
  };
}
