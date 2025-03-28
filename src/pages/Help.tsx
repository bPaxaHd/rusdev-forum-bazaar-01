
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Help = () => {
  const faqs = [
    {
      question: "Как создать аккаунт на DevTalk?",
      answer: "Для создания аккаунта нажмите кнопку 'Регистрация' в правом верхнем углу сайта. Заполните необходимые поля в форме регистрации, включая имя пользователя, электронную почту и пароль. После этого проверьте свою электронную почту и подтвердите регистрацию, перейдя по ссылке в письме."
    },
    {
      question: "Как задать вопрос на форуме?",
      answer: "Чтобы задать вопрос на форуме, вам необходимо войти в свой аккаунт. Затем перейдите на страницу форума, нажмите кнопку 'Создать тему' и заполните форму, указав заголовок, категорию и текст вопроса. После этого нажмите 'Опубликовать', и ваш вопрос появится на форуме."
    },
    {
      question: "Как ответить на существующую тему на форуме?",
      answer: "Чтобы ответить на существующую тему, откройте интересующую вас тему, прокрутите страницу до формы комментария внизу, введите свой ответ и нажмите кнопку 'Отправить'. Ваш ответ будет добавлен к обсуждению и станет виден всем участникам форума."
    },
    {
      question: "Как изменить настройки профиля?",
      answer: "Для изменения настроек профиля войдите в свой аккаунт, нажмите на ваш аватар в правом верхнем углу страницы и выберите 'Настройки'. На странице настроек вы можете изменить личную информацию, загрузить новый аватар, обновить пароль и настроить другие параметры вашего профиля."
    },
    {
      question: "Что делать, если я забыл пароль?",
      answer: "Если вы забыли пароль, перейдите на страницу входа и нажмите на ссылку 'Забыли пароль?' под формой входа. Введите адрес электронной почты, связанный с вашим аккаунтом, и мы отправим вам инструкции по сбросу пароля."
    },
    {
      question: "Как отметить ответ как решение проблемы?",
      answer: "Если вы автор темы и получили ответ, который решил вашу проблему, вы можете отметить его как решение, нажав на кнопку 'Отметить как решение' рядом с этим ответом. Это поможет другим пользователям быстро найти решение аналогичной проблемы."
    },
    {
      question: "Как следить за интересующими темами?",
      answer: "Чтобы следить за темой, откройте ее и нажмите кнопку 'Подписаться' вверху страницы. После этого вы будете получать уведомления о новых ответах в этой теме. Вы также можете управлять подписками в настройках вашего профиля."
    },
    {
      question: "Могу ли я удалить свой аккаунт?",
      answer: "Да, вы можете удалить свой аккаунт. Для этого перейдите в настройки профиля, прокрутите страницу до раздела 'Опасная зона' и нажмите кнопку 'Удалить аккаунт'. Обратите внимание, что это действие необратимо и приведет к удалению всех ваших данных с платформы."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          Помощь
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Часто задаваемые вопросы</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Найдите ответы на часто задаваемые вопросы о платформе DevTalk.
        </p>

        <Accordion type="single" collapsible className="mb-12">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="bg-muted/30 border rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Не нашли ответ на свой вопрос?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Свяжитесь с нашей командой поддержки, и мы поможем вам решить любую проблему,
            связанную с использованием платформы.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Badge variant="outline" className="px-4 py-2 text-base font-normal">
              support@devtalk.ru
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-base font-normal">
              +7 (495) 123-45-67
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
