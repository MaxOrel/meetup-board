// Полный сценарий входа на живом API: регистрация → профиль → перезагрузка → выход → вход.
// Почта каждый раз новая — тест можно гонять сколько угодно раз на одной базе.

describe('Вход и профиль', () => {
  const password = 'password123'
  const name = 'Ира Новикова'
  let email: string

  beforeEach(() => {
    email = `ira-${Date.now()}@example.com`
  })

  it('гость → регистрация → профиль → перезагрузка → выход → вход', () => {
    cy.intercept('POST', '**/api/v1/auth/register').as('register')
    cy.intercept('POST', '**/api/v1/auth/login').as('login')

    // Профиль закрыт: гостя отправляют на вход
    cy.visit('/profile')
    cy.location('pathname').should('eq', '/login')

    // Регистрация
    cy.contains('a', 'Регистрация').click()
    cy.get('#name').type(name)
    cy.get('#email').type(email)
    cy.get('#password').type(password)
    cy.contains('button', 'Создать аккаунт').click()
    cy.wait('@register').its('response.statusCode').should('eq', 201)
    // Сессия — в httpOnly-cookie: JavaScript страницы её не видит, в localStorage токена нет
    cy.getCookie('meetup_session').should('have.property', 'httpOnly', true)
    cy.window().its('localStorage').invoke('getItem', 'meetup-token').should('be.null')

    // После регистрации — обратно туда, куда шли
    cy.location('pathname').should('eq', '/profile')
    cy.contains('h1', name)
    cy.contains('header a', 'Ира')

    // Перезагрузка: cookie на месте, сервер по /me подтверждает, кто это
    // Перехват ставим здесь: первый /me был ещё гостевым (401), его ждать не нужно
    cy.intercept('GET', '**/api/v1/me').as('me')
    cy.reload()
    cy.wait('@me').its('response.statusCode').should('eq', 200)
    cy.contains('h1', name)

    // Выход: сервер стёр cookie, профиль снова закрыт
    cy.contains('button', 'Выйти').click()
    cy.location('pathname').should('eq', '/login')
    cy.contains('header a', 'Войти')
    cy.getCookie('meetup_session').should('be.null')

    // Вход тем же аккаунтом
    cy.get('#email').type(email)
    cy.get('#password').type(password)
    cy.contains('button', /^Войти$/).click()
    cy.wait('@login').its('response.statusCode').should('eq', 200)
    cy.contains('h1', name)
  })

  it('неверный пароль — сообщение, а не вход', () => {
    cy.visit('/login')
    cy.get('#email').type('user@meetup.local')
    cy.get('#password').type('wrong-password')
    cy.contains('button', /^Войти$/).click()

    cy.contains('[role=alert]', 'Неверная почта или пароль')
    cy.location('pathname').should('eq', '/login')
  })

  it('занятая почта — ошибка у поля, а не общая', () => {
    cy.visit('/register')
    cy.get('#name').type(name)
    cy.get('#email').type('user@meetup.local')
    cy.get('#password').type(password)
    cy.contains('button', 'Создать аккаунт').click()

    cy.get('#email').should('have.attr', 'aria-invalid', 'true')
    cy.get('#email-error').should('contain', 'Аккаунт с этой почтой уже есть')
  })
})
