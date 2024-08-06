export function calculateStartDate(dayNo: number | null, createdAt: Date) {
  let startDate = new Date();

  if (!dayNo) {
    startDate = new Date(createdAt);
  } else {
    startDate.setDate(startDate.getDate() - dayNo);
  }

  if (startDate < createdAt) startDate = createdAt;

  return startDate;
}
