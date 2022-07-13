import API from "./api";

class User {
  static getId() {
    return document.cookie.replace(
      /(?:(?:^|.*;\s*)userid\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
  }

  static async updateAbout(id, name, location, about) {
    let data = await API.m(
      `mutation($id: Int!, $name: String!, $location: String!, $about: String!){ updateAbout(id: $id, name: $name, location: $location, about: $about)}`,
      {
        id: id,
        name: name,
        location: location,
        about: about,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.updateAbout;
  }

  static async profile(id) {
    let data = await API.q(
      `query($id: Int!){ getProfile(id: $id) {name, about, location, user_type, id}}`,
      {
        id: id,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.getProfile;
  }

  static async logout() {
    let data = await API.q("query { logoutUser }");
    if (data.errors) {
      throw Error(data.errors[0].message);
    }

    return data.data.logoutUser;
  }

  static async login(email, password) {
    let data = await API.q(
      `query($uname: String!, $pword: String!){ signInUser(email: $uname, password: $pword) }`,
      {
        uname: email,
        pword: password,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }

    return data.data.signInUser;
  }

  static async signUp(name, password, email, userType) {
    let data = await API.m(
      `mutation($name: String!, $password: String!, $email: String!, $userType: String!) { signUpUser(name: $name, password: $password, email: $email, userType: $userType) }`,
      {
        name: name,
        password: password,
        email: email,
        userType: userType,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.signUpUser;
  }
  static async checkProfileExists(email) {
    let data = await API.m(
      `query ($email: String!) { checkProfileExists(email: $email) }`,
      {
        email: email,
      }
    );
    if (data.errors) {
      throw Error(data.errors[0].message);
    }
    return data.data.checkProfileExists;
  }
}
export default User;
