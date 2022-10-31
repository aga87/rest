import { ObjectSchema } from 'joi';

export const validateSchema = ({
  reqSchema,
  validSchema
}: {
  reqSchema: unknown;
  validSchema: ObjectSchema;
}): null | string[] => {
  const { error } = validSchema.validate(
    reqSchema,
    // Get all errors (not only the first one)
    { abortEarly: false }
  );
  if (error) {
    const errorList: string[] = [];
    error.details.forEach((error) => errorList.push(error.message));
    return errorList;
  }
  return null;
};
