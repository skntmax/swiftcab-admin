const { default: axios } = require("axios");

class Router {
  basepath;
  constructor(base) {
    this.basepath = `${process.env.NEXT_PUBLIC_API_URL}/${base}`;
  }

  get(url, headers={}) {
    return axios
      .get(`${this.basepath}/${url}` , headers)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        return err.error;
      });
  }

  post(url ,model, headers={}) {
    return axios
    .post(`${this.basepath}/${url}` , model , headers )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err.error;
    });
  }
}

const v1Router = new Router("v1");

export { v1Router };
