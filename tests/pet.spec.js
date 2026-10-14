// Bibliotecas e Frameworks
import { expect, test } from '@playwright/test'

// Variáveis em comum
import pet from '../data/json/pet.json'

import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'

// Funções em comum (apoio)

// Os Testes

// Um grupo de testes que é executado sequencialmente
test.describe.serial('Testes Positivos', async () => {

    test('Incluir Pet', async ({ request }) => {
        // Arrange - Prepara
        // Os dados para o teste virão do arquivo pet.json

        // Act - Executa
        // Aqui o que muda é o método desejado: post, get, put, delete
        // dentro dessa linha temos que passar algumas informações:
        // - Header (cabeçalho): não vamos usar aqui
        // URI/endpoint: enderço de API + entidade - no caso '/pet'
        // Data (dados): json que vai enviar - no caso data: pet
        const response = await request.post('pet', {
            data: pet
        }) // Final da ação de post

        // Assert - Validações
        expect(response.status()).toBe(200) // Status code = 200
        expect(await response.json()).toStrictEqual(pet) // Compara se a resposta foi igual ao body da requisição

    }) // Fecha o incluir

    test('Consultar Pet', async ({ request }) => {
        // Arrange - Prepara
        // O pet.id virá do arquivo pet.json

        // Act - Executa
        // const response = await request.get('/pet/' + pet.id)
        const response = await request.get(`pet/${pet.id}`) // Outro jeito de fazer a linha de cima

        // Assert - Valida
        expect(response.status()).toBe(200)
        const responseJson = await response.json()

        expect(responseJson.id).toBe(pet.id)
        expect(responseJson.category.id).toBe(pet.category.id)
        expect(responseJson.category.name).toBe(pet.category.name)
        expect(responseJson.name).toBe(pet.name)
        // expect(responseJson.photoUrls).toBe(pet.photoUrls)
        expect(responseJson.tags[0].id).toBe(pet.tags[0].id)
        expect(responseJson.tags[0].name).toBe(pet.tags[0].name)
        expect(responseJson.status).toBe(pet.status)

    })

    const massa = parse(readFileSync('data/csv/pets.csv'), {
        columns: true
    })

    massa.forEach(linha => {

        test(`Incluir Pet DDT - ${linha.name}`, async ({ request }) => {
            // Arrange - Prepara
            // Criar o objeto pet e adicionar os dados do csv nele
            // Cada linha do csv será um teste
            const pet = {}
            pet.id = parseInt(linha.id)
            pet.category = {}
            pet.category.id = parseInt(linha.categoryId)
            pet.category.name = linha.categoryName
            pet.name = linha.name
            pet.photoUrls = []
            pet.tags = []
            let tags = linha.tags.split(':')
            tags.forEach(tag => {
                let tagFormatada = tag.split(';')
                let novaTag = {
                    id: parseInt(tagFormatada[0]),
                    name: tagFormatada[1]
                }
                pet.tags.push(novaTag)

            }) // Fecha o tags.forEach
            pet.status = linha.status

            // Act - Executa
            const response = await request.post('pet', {
                data: pet
            })

            // Assert - Valida
            expect(response.status()).toBe(200)
            expect(await response.json()).toEqual(pet)            

        }) // Fecha o Incluir Pet DDT

    }) // Fecha o massa.forEach

}) // Fecha o grupo de testes

