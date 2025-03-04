import React, {useEffect, useState} from 'react'
import {Stack, Card, Text, Select, Button, Flex, Box} from '@sanity/ui'
import {set, unset} from 'sanity'
import {HARDCODED_COUNTRIES} from '../../next/app/lib/countries'

export const RegionReferenceInput = (props) => {
  const {onChange, value = []} = props
  const [countries, setCountries] = useState(HARDCODED_COUNTRIES)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCountries = async () => {
    try {
      setIsLoading(true)
      // Just use the hardcoded countries from the shared lib
      setCountries(HARDCODED_COUNTRIES)
    } catch (err) {
      console.error('Error fetching countries:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCountries()
  }, [])

  const handleSelect = (event) => {
    const countryId = event.target.value

    // If country is already selected, don't add it again
    if (value.includes(countryId)) return

    // Add the country ID to the array
    onChange(set([...value, countryId]))
  }

  const handleRemove = (countryId) => {
    // Remove the country ID from the array
    onChange(set(value.filter((id) => id !== countryId)))
  }

  if (isLoading) return <Text>Loading countries...</Text>
  if (error)
    return (
      <Stack space={3}>
        <Text tone="critical">Error: {error}</Text>
        <Button
          text="Try again"
          tone="primary"
          onClick={() => {
            setError(null)
            setIsLoading(true)
            fetchCountries()
          }}
        />
      </Stack>
    )

  return (
    <Stack space={3}>
      <Select onChange={handleSelect} value="" fontSize={2}>
        <option value="" disabled>
          Select a country
        </option>
        {countries.map((country) => (
          <option key={country.id} value={country.id}>
            {country.name} ({country.continent})
          </option>
        ))}
      </Select>

      {value.length > 0 && (
        <Stack space={2} marginTop={4}>
          {value.map((countryId) => {
            const country = countries.find((c) => c.id === countryId)
            return (
              <Card key={countryId} padding={3} radius={2} tone="primary">
                <Flex align="center" justify="space-between">
                  <Text>{country ? `${country.name} (${country.continent})` : countryId}</Text>
                  <Button
                    mode="ghost"
                    tone="critical"
                    onClick={() => handleRemove(countryId)}
                    text="Remove"
                  />
                </Flex>
              </Card>
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}
