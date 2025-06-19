import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import * as Yup from "yup";
import AuthForm from "../components/AuthForm";

const URL = import.meta.env.VITE_API_URL;

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const initialValues: LoginForm = { email: "", password: "" };
  const validationSchema = Yup.object({
    email: Yup.string().email("Неверный email").required("Обязательное поле"),
    password: Yup.string()
      .min(6, "Минимум 6 символов")
      .required("Обязательное поле"),
  });

  const onSubmit = async (
    values: LoginForm,
    { setStatus, setSubmitting }: any
  ) => {
    setStatus(null);
    try {
      const { data } = await axios.post(`${URL}/auth/login`, values, {
        headers: { "Content-Type": "application/json" },
      });
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setStatus({
        success: false,
        message: err.response?.data?.message || "Ошибка при входе",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const extra = (
    <>
      Нет аккаунта?{" "}
      <Link to="/register" className="text-blue-600 hover:underline">
        Зарегистрироваться
      </Link>
    </>
  );

  return (
    <AuthForm<LoginForm>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      title="Войти в систему"
      submitText="Войти"
      extra={extra}
    />
  );
};

export default LoginPage;
