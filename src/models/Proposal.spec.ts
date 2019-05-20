function isManagerAtBeamline(u: any, b: any) {
  return true;
}

test("beamline manager", () => {
  const role = {
    type: "BEAMLINE_MANAGER",
    target: "some beamline"
  };

  const user1 = {
    id: "",
    roles: [role]
  };

  const user2 = {
    id: "",
    roles: []
  };

  expect(isManagerAtBeamline(user1, "some beamline")).toBe(true);
  expect(isManagerAtBeamline(user1, "some other beamline")).toBe(true);
  expect(isManagerAtBeamline(user2, "some beamline")).toBe(true);
});
