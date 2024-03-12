function validateTeamNumber(teamNumber: string): boolean {
  return !(teamNumber.length > 4 || isNaN(parseInt(teamNumber)));
}

export { validateTeamNumber };