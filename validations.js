import { extend } from "vee-validate";
import {
  required,
  email,
  regex,
  confirmed,
  min,
  numeric,
  integer,
  alpha_num
} from "vee-validate/dist/rules";
import axios from "axios";
import dayjs from "dayjs";
import i18n from "@/plugins/i18n.js";

extend("alpha_num", {
  ...alpha_num,
  message: "{_field_} must only contain alphabetical letters and numbers."
});

extend("regex", {
  ...regex,
  message: field => i18n.t("VALIDATION.REGEX", { fieldName: field })
});

extend("passwordRegex", {
  ...regex,
  message: "{_field_} must be stronger"
});

/**
 * Password criteria, must have:
 * - one upper case letter
 * - one lower case letter
 * - a digit
 * - a special character only specific ones are approved
 * - the right length and no other characters
 */
extend("profilePassword", {
  validate(value) {
    return (
      /[a-z]{1,}/.test(value) &&
      /[A-Z]{1,}/.test(value) &&
      /[0-9]{1,}/.test(value) &&
      /[!@$?\-_]{1,}/.test(value) &&
      /^[a-zA-Z0-9!@$?\-_]{8,25}$/.test(value)
    );
  },
  message:
    "Please enter a valid password. It must have a capital letter, lowercase letter, number, and special character (only ! @ $ ? _ - are accepted)"
});

extend("postalCodeRegex", {
  ...regex,
  message: field => i18n.t("VALIDATION.POSTAL_CODE_REGEX")
});

extend("confirmed", {
  ...confirmed,
  message: "Passwords do not match"
});

extend("confirmEmail", {
  ...confirmed,
  message: field => i18n.t("VALIDATION.EMAIL_MISMATCH")
});

extend("confirmTaxPin", {
  ...confirmed,
  message: "Tax PINs do not match"
});

extend("required", {
  ...required,
  message: field => i18n.t("VALIDATION.REQUIRED", { fieldName: field })
});

extend("email", {
  ...email,
  message: field => i18n.t("VALIDATION.EMAIL", { fieldName: field })
});

extend("min", {
  ...min,
  message: "{_field_} minimum length must be of {length} characters."
});

extend("accountNumberRegex", {
  ...regex,
  message: "{_field_} must start with letter P."
});

extend("licenseNumberRegex", {
  ...regex,
  message: "{_field_} must start with letter D, C or L."
});

extend("streetNameInvalid", {
  validate(value) {
    return value ? false : true;
  },
  message: "Please enter a valid street address."
});

extend(
  "selectionUnique",
  {
    params: ["target", "target2", "target3", "target4"],
    validate(value, { target, target2, target3, target4 }) {
      var val = (value || {}).id;
      return (
        val != (target || {}).id &&
        val != (target2 || {}).id &&
        val != (target3 || {}).id &&
        val != (target4 || {}).id
      );
    },
    message: "Please select a unique option"
  },
  { hasTarget: true }
);

extend("validDate", {
  params: ["dateRegex", "dateFormat"],
  validate(value, { dateRegex, dateFormat }) {
    const valid = dayjs(value, dateFormat).format(dateFormat) === value;
    return dateRegex.test(value) && valid;
  },
  message: (field, args) =>
    "Please enter a valid date in " + args.dateFormat + " format"
});

extend("minDate", {
  params: ["minDate", "errorMessage", "dateFormat"],
  validate(value, { minDate, dateFormat }) {
    let date =
      minDate !== undefined && minDate !== null ? dayjs(minDate) : dayjs();
    let valueDate = dayjs(value, dateFormat);
    return date.isSame(valueDate, "day") || date.isBefore(valueDate, "day");
  },
  message(field, params) {
    return params.errorMessage;
  }
});

extend("maxDate", {
  params: ["maxDate", "errorMessage"],
  validate(value, { maxDate }) {
    return dayjs(value).isBefore(maxDate);
  },
  message(field, params) {
    return params.errorMessage;
  }
});

extend("dateWeekDayOnly", {
  params: ["dateFormat"],
  validate(value, { dateFormat }) {
    let whichDay = dayjs(value, dateFormat).day();
    if (whichDay === 6 || whichDay === 0) {
      return false;
    } else {
      return true;
    }
  },
  message: (field, args) =>
    "Sorry, you cannot choose a date which occurs on a weekend."
});

extend("numeric", {
  ...numeric,
  message: "Please enter a valid number"
});

extend("integer", {
  ...integer,
  message: "Please enter a valid number"
});

extend("phoneNumber", {
  validate(value) {
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}?[,]?[0-9]{0,5}$/.test(
      value
    );
  },
  message: "Please enter a valid phone number."
});

extend("lengthBetween", {
  params: ["min", "max"],
  message(field, params) {
    if (params.min && params.max) {
      return `Must be between ${params.min} and ${params.max} characters long`;
    }
    return `Must be exactly ${params.min} characters long`;
  },
  validate(value, params) {
    if (!value) {
      return false;
    }

    if (params.min && params.max) {
      return value.length >= params.min && value.length <= params.max;
    } else if (params.min) {
      return value.length >= params.min;
    } else if (params.max) {
      return value.length <= params.max;
    }

    return false;
  }
});

extend("futureDateNotAllowed", {
  validate(value) {
    return !dayjs(value).isAfter(dayjs().format("YYYY-MM-DD"));
  },
  message(field) {
    return `${field} can not be a future date`;
  }
});

extend("prohibtedBreed", {
  validate() {
    return false;
  },
  message() {
    return `Prohibited breed`;
  }
});

extend("profileEmailUniqueOrSame", {
  params: ["initialEmail"],
  message:
    "The email address you entered is already associated with a registered user",
  validate(value, params) {
    if (value && params.initialEmail && value === params.initialEmail)
      return true;
    return axios
      .get(`${process.env.VUE_APP_URL_PROFILE}validate-email?email=${value}`)
      .then(res => {
        return res && res.data;
      })
      .catch(err => {
        console.error("Error validating profile email", err);
        return false;
      });
  }
});

extend("disputeExplanationRequired", {
  ...required,
  message: field => "You must tell us the reason you’re disputing your ticket."
});
