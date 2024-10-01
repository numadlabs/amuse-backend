interface UpdateData {
  [key: string]: any;
}

interface ChangedField {
  old: any;
  new: any;
}

interface ChangedFields {
  [key: string]: ChangedField;
}

export function parseChangedFieldsFromObject(oldObject: any, newObject: any) {
  let changedFields: ChangedFields = {};
  (Object.keys(newObject) as Array<keyof UpdateData>).forEach((key) => {
    const updateValue = newObject[key];
    const currentValue = oldObject[key];

    if (updateValue !== currentValue) {
      changedFields[key] = {
        old: currentValue,
        new: updateValue,
      };
    }
  });

  return changedFields;
}
