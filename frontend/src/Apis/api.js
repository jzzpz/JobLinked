class API {
  static send(method, url, data) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        if (xhr.status !== 200) {
          reject(xhr);
        } else resolve(xhr);
      };
      xhr.open(method, url, true);
      if (!data) xhr.send();
      else {
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(data));
      }
    });
  }

  static async q(query, variables = {}) {
    return new Promise(async (resolve, reject) => {
      let req;
      API.send("POST", "/graphql", {
        query: query,
        variables: variables,
      }).then(
        (res) => {
          req = JSON.parse(res.responseText);
          resolve(req);
        },
        (rej) => {
          req = JSON.parse(rej.responseText);
          resolve(req);
        }
      );
    });
  }
  static async m(mutation, variables = {}) {
    return new Promise(async (resolve, reject) => {
      let req;
      API.send("POST", "/graphql", {
        query: mutation,
        variables: variables,
      }).then(
        (res) => {
          req = JSON.parse(res.responseText);
          resolve(req);
        },
        (rej) => {
          req = JSON.parse(rej.responseText);
          resolve(req);
        }
      );
    });
  }
}

export default API;
