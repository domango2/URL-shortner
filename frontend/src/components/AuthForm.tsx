import { Formik, Form, Field, ErrorMessage } from "formik";
import type { FormikHelpers, FormikValues } from "formik";
import * as Yup from "yup";

interface AuthFormProps<T> {
  initialValues: T;
  validationSchema: Yup.ObjectSchema<any>;
  onSubmit: (values: T, formikHelpers: FormikHelpers<T>) => Promise<void>;
  title: string;
  submitText: string;
  extra?: React.ReactNode;
}

function AuthForm<T extends FormikValues>({
  initialValues,
  validationSchema,
  onSubmit,
  title,
  submitText,
  extra,
}: AuthFormProps<T>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          {title}
        </h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form className="space-y-5">
              {status && (
                <div
                  className={`p-3 rounded-md ${
                    status.success
                      ? "text-green-700 bg-green-100"
                      : "text-red-700 bg-red-100"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block mb-1 text-gray-600">
                  Email
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-3 sm:px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="mt-1 text-red-600 text-sm"
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-1 text-gray-600">
                  Пароль
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 sm:px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="mt-1 text-red-600 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              >
                {isSubmitting ? submitText + "..." : submitText}
              </button>
            </Form>
          )}
        </Formik>
        {extra && <div className="text-center text-gray-600">{extra}</div>}
      </div>
    </div>
  );
}

export default AuthForm;
