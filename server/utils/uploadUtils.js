const imagekit = require("../config/imagekit");

const uploadImageKit = async (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: fileBuffer,
        fileName: fileName,
        folder: "/gitHired/resumes/",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.url);
      },
    );
  });
};

module.exports = {
  uploadImageKit,
};
