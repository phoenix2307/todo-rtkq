import { selectThemeMode, setIsLoggedInAC } from "@/app/app-slice"
import { AUTH_TOKEN } from "@/common/constants"
import { ResultCode } from "@/common/enums"
import { useAppDispatch, useAppSelector } from "@/common/hooks"
import { getTheme } from "@/common/theme"
import { useCaptchaQuery, useLoginMutation } from "@/features/auth/api/authApi"
import { type LoginInputs, loginSchema } from "@/features/auth/lib/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import FormLabel from "@mui/material/FormLabel"
import Grid from "@mui/material/Grid"
import TextField from "@mui/material/TextField"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import styles from "./Login.module.css"
import { useState } from "react"

export const Login = () => {
  const themeMode = useAppSelector(selectThemeMode)
  const dispatch = useAppDispatch()
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captchaValue, setCaptchaValue] = useState("")
  const { data: captchaData, refetch: refetchCaptcha } = useCaptchaQuery(undefined, { skip: !showCaptcha })
  const [login] = useLoginMutation()
  const theme = getTheme(themeMode)

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false, captcha: "" },
  })

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    try {
      const response = await login(data).unwrap()

      if (response.resultCode === ResultCode.CaptchaError) {
        // Помилка капчі - показуємо капчу
        setShowCaptcha(true)
        await refetchCaptcha() // Отримуємо нову капчу
        return
      }
      if (response.resultCode === ResultCode.Success) {
        dispatch(setIsLoggedInAC({ isLoggedIn: true }))
        localStorage.setItem(AUTH_TOKEN, response.data.token)
        reset()
      }
    } catch (error) {
      console.log("Login error: ", error)
    }
  }

  const handleCaptchaSubmit = async () => {
    // Встановлюємо значення капчі у форму
    setValue("captcha", captchaValue)
    // Очищаємо поле капчі
    setCaptchaValue("")
    // Ховаємо капчу
    setShowCaptcha(false)
  }

  return (
    <Grid container justifyContent={"center"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl>
          <FormLabel>
            <p>
              To login get registered
              <a
                style={{ color: theme.palette.primary.main, marginLeft: "5px" }}
                href="https://social-network.samuraijs.com"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
            </p>
            <p>or use common test account credentials:</p>
            <p>
              <b>Email:</b> free@samuraijs.com
            </p>
            <p>
              <b>Password:</b> free
            </p>
          </FormLabel>

          {/*//todo: капча має бути десь тут
          1. при отриманні resultCode === 10 ми рендеримо не форму логіна а блок з картинкою та полем вводу відповіді до капчі
          2. після відправки тексту-відповіді ми рендеримо сторінку логіна, вводимо іще раз правильно дані
          Flow:
          1. приходить resultCode === 10.
          2. робимо запит на сервер для отримання url картинки.
          3. при отриманні відповіді з сервера, вивести цю картинку на екран разом з формою відправки, або реалізувати, щоб капча відображалася замість Textfields for email and password.
          4. відправити відповідь капчі на сервер
          5. у випадку правильної відповіді відобразити поля логінізації, при неправильній відповіді зробити флоу запитк на сервер за капчею іще раз.
          Рішення: потрібна ф-ція capthcaQuery, яка буде містити у собі логіку запиту. Це іще один ендпойнт в authApi.
          endpoint: '/security/get-captcha-url'. Response: {url: string}
          */}

          {/*Пояснення реалізації:
Стан капчі:

Додано showCaptcha для відстеження, чи потрібно показувати капчу

Додано captchaValue для зберігання введеного користувачем тексту капчі

Запит капчі:

Використовуємо useCaptchaQuery з RTK Query

Запит виконується тільки при showCaptcha=true завдяки параметру skip

Обробка помилки капчі:

Якщо resultCode === ResultCode.CaptchaError, встановлюємо showCaptcha=true та робимо запит нової капчі

Відображення капчі:

Коли showCaptcha=true, показуємо зображення капчі та поле для введення

Після введення капчі, вона додається до форми та форма логіна показується знову

Потік роботи:

Користувач вводить логін/пароль

Якщо потрібна капча - показується капча

Після введення капчі, форма логіна з'являється знову

Якщо капча введена правильно, логін проходить успішно*/}

          <FormGroup>
            {showCaptcha ? (
              <>
                {captchaData?.url && (
                  <div className={styles.captcha}>
                    <img src={captchaData.url} alt="captcha" className={styles.imgCaptcha} />
                    <TextField
                      label="enter Captcha"
                      value={captchaValue}
                      onChange={(e) => setCaptchaValue(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCaptchaSubmit}
                      style={{ marginBottom: "16px" }}
                    >
                      Submit Captcha
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <TextField label="Email" margin="normal" error={!!errors.email} {...register("email")} />
                {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
                <TextField
                  type="password"
                  label="Password"
                  margin="normal"
                  error={!!errors.email}
                  {...register("password")}
                />
                {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}
                <FormControlLabel
                  label={"Remember me"}
                  control={
                    <Controller
                      name={"rememberMe"}
                      control={control}
                      render={({ field: { value, ...field } }) => <Checkbox {...field} checked={value} />}
                    />
                  }
                />
                <Button type="submit" variant="contained" color="primary">
                  Login
                </Button>
              </>
            )}
          </FormGroup>
        </FormControl>
      </form>
    </Grid>
  )
}
