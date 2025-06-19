import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import * as Yup from "yup";
import AuthForm from "../components/AuthForm";

const URL = import.meta.env.VITE_API_URL;

interface RegisterForm {
  email: string;
  password: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const initialValues: RegisterForm = { email: "", password: "" };
  const validationSchema = Yup.object({
    email: Yup.string().email("Неверный email").required("Обязательное поле"),
    password: Yup.string()
      .min(6, "Минимум 6 символов")
      .required("Обязательное поле"),
  });

  const onSubmit = async (
    values: RegisterForm,
    { setStatus, setSubmitting }: any
  ) => {
    setStatus(null);
    try {
      await axios.post(`${URL}/auth/register`, values, {
        headers: { "Content-Type": "application/json" },
      });
      setStatus({
        success: true,
        message: "Учётная запись создана! Перенаправляем...",
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setStatus({
        success: false,
        message: err.response?.data?.message || "Ошибка при регистрации",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const extra = (
    <>
      Уже есть аккаунт?{" "}
      <Link to="/login" className="text-blue-600 hover:underline">
        Войти
      </Link>
    </>
  );

  return (
    <AuthForm<RegisterForm>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      title="Регистрация"
      submitText="Зарегистрироваться"
      extra={extra}
    />
  );
};

export default RegisterPage;
