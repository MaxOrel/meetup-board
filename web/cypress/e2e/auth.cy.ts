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
    cy.intercept('POST', '**/api/v1/auth/*').as('auth')
    cy.intercept('GET', '**/api/v1/me').as('me')

    // Профиль закрыт: гостя отправляют на вход
    cy.visit('/profile')
    cy.location('pathname').should('eq', '/login')

    // Регистрация
    cy.contains('a', 'Регистрация').click()
    cy.get('#name').type(name)
    cy.get('#email').type(email)
    cy.get('#password').type(password)
    cy.contains('button', 'Создать аккаунт').click()
    cy.wait('@auth').its('response.statusCode').should('eq', 201)

    // После регистрации — обратно туда, куда шли
    cy.location('pathname').should('eq', '/profile')
    cy.contains('h1', name)
    cy.contains('header a', 'Ира')

    // Перезагрузка: токен сохранён, сервер по /me подтверждает, кто это
    cy.reload()
    cy.wait('@me').its('response.statusCode').should('eq', 200)
    cy.contains('h1', name)

    // Выход: токен забыт, профиль снова закрыт
    cy.contains('button', 'Выйти').click()
    cy.location('pathname').should('eq', '/login')
    cy.contains('header a', 'Войти')
    cy.window().its('localStorage').invoke('getItem', 'meetup-token').should('be.null')

    // Вход тем же аккаунтом
    cy.get('#email').type(email)
    cy.get('#password').type(password)
    cy.contains('button', /^Войти$/).click()
    cy.wait('@auth').its('response.statusCode').should('eq', 200)
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
