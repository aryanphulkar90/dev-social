
const validateProfileEditRequest = (req) =>{
    const editAllowedFields = [
      "firstName",
      "lastName",
      "age",
      "gender",
      "photoURL",
      "about"
    ];

    const reqFields = Object.keys(req.body);

    const isAllowed = reqFields.every((field) =>
      editAllowedFields.includes(field)
    );

    if (!isAllowed) {
      throw new Error("Edit not allowed");
    }
}

module.exports = {validateProfileEditRequest}
