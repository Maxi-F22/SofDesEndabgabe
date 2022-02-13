import { UserManagement } from "../classes/User";

describe("Test the Username Validity Function", () => {
  let userManagement = new UserManagement;
  let valid = "Benutzer";
  let invalid = "Benut..zer";
  test("Check username function!", () => {
    expect(userManagement.checkUsernameValidity(valid)).toBeTruthy();
  });
  test("Check username function!", () => {
    expect(userManagement.checkUsernameValidity(invalid)).toBeFalsy();
  });
});