export const sortGroups = (a, b) =>
  b.season - a.season || a.groupname.localeCompare(b.groupname)
