// Сценарий пользователя от начала до конца: найти событие, открыть, добавить в избранное.
// Ничего не мокаем — если сломается фронт, API или база, тест упадёт.

describe('Афиша', () => {
  beforeEach(() => {
    // Следим за запросами к API, чтобы дожидаться ответа, а не ставить паузы
    cy.intercept('GET', '**/api/v1/events?*').as('events')
    cy.visit('/events')
    cy.wait('@events')
  })

  it('поиск сужает каталог и уходит на сервер одним запросом', () => {
    // Отдельно ловим запросы поиска: любой запрос с параметром q
    cy.intercept('GET', '**/api/v1/events?*q=*').as('search')
    cy.contains('[role=status]', 'Найдено: 1000')

    cy.get('input[type=search]').type('docker')

    // debounce: шесть букв — ровно один запрос поиска, и сразу с полным словом
    cy.wait('@search').its('request.url').should('include', 'q=docker')
    cy.contains('[role=status]', /^Найдено: \d+$/).should('not.contain', '1000')
    cy.get('@search.all').should('have.length', 1)
    cy.get('main article h3').each(($title) => {
      expect($title.text().toLowerCase()).to.contain('docker')
    })
  })

  it('событие → избранное → назад в каталог', () => {
    cy.get('main article h3 a').first().then(($link) => {
      const title = $link.text()
      cy.wrap($link).click()

      cy.location('pathname').should('match', /^\/events\/[0-9a-f-]{36}$/)
      cy.contains('h1', title)

      cy.contains('button', 'В избранное').click()
      cy.contains('button', 'Убрать из избранного')
      cy.contains('header a', 'Избранное').should('contain', '1')

      cy.go('back')
      cy.contains('main article', title).find('button[aria-pressed=true]')
    })
  })

  it('неизвестный адрес — страница «Такой страницы нет»', () => {
    cy.visit('/nope')
    cy.contains('Такой страницы нет')
    cy.contains('a', 'Ко всем событиям').click()
    cy.location('pathname').should('eq', '/events')
  })
})
