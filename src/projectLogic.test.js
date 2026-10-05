import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateSimilarityScore } from './projectLogic.js'

test('identical text scores as a complete match', () => {
  assert.equal(calculateSimilarityScore('Smart irrigation monitors crop moisture', 'Smart irrigation monitors crop moisture'), 100)
})

test('word order, case, and punctuation do not change the match', () => {
  assert.equal(calculateSimilarityScore('Crop-moisture sensor for smart irrigation', 'SMART irrigation sensor crop moisture'), 100)
})

test('unrelated text scores zero', () => {
  assert.equal(calculateSimilarityScore('Crop irrigation moisture sensor', 'Hospital appointment billing records'), 0)
})

test('a short text contained in a longer project does not score as a complete match', () => {
  const candidate = 'smart irrigation crop sensor'
  const reference = 'smart irrigation crop sensor bluetooth medical imaging data warehouse'
  const score = calculateSimilarityScore(candidate, reference)

  assert.ok(score > 0 && score < 100)
  assert.equal(score, calculateSimilarityScore(reference, candidate))
})

test('empty or stop-word-only input scores zero', () => {
  assert.equal(calculateSimilarityScore('', 'smart irrigation sensor'), 0)
  assert.equal(calculateSimilarityScore('the and with', 'smart irrigation sensor'), 0)
})