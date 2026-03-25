import { getCodeList } from 'country-list'

const categoryOptions = [
  {
    value: 'Legal Identity',
    label: 'Legal Identity'
  },
  {
    value: 'Educational',
    label: 'Educational'
  },
  {
    value: 'Financial',
    label: 'Financial'
  },
  {
    value: 'Game',
    label: 'Game'
  },
  {
    value: 'Healthcare',
    label: 'Healthcare'
  },
  {
    value: 'On-chain Activities',
    label: 'On-chain Activities'
  },
  {
    value: 'Social',
    label: 'Social'
  },
  {
    value: 'Skills',
    label: 'Skills'
  },
  {
    value: 'Others',
    label: 'Others'
  }
]

const countries = getCodeList()
let countryOptions = Object.keys(countries).map((key) => ({
  value: countries[key],
  label: countries[key]
}))

countryOptions.sort((a, b) =>
  a.label > b.label ? 1 : b.label > a.label ? -1 : 0
)

countryOptions = [
  ...[
    { value: 'World scope', label: 'World scope' },
    { value: 'Regional scope', label: 'Regional scope' }
  ],
  ...countryOptions
]

const optsOptions = [
  {
    value: '=',
    label: '='
  },
  {
    value: '!=',
    label: '!='
  },
  {
    value: '>',
    label: '>'
  },
  {
    value: '>=',
    label: '>='
  },
  {
    value: '<',
    label: '<'
  },
  {
    value: '<=',
    label: '<='
  },
  {
    value: 'contain',
    label: 'contain'
  },
  {
    value: 'in',
    label: 'in'
  },
  {
    value: 'not in',
    label: 'not in'
  }
]

const fieldTypeOptions = [
  {
    value: 'id',
    label: 'User identification'
  },
  {
    value: 'condition',
    label: 'Condition'
  }
]

export { categoryOptions, countryOptions, fieldTypeOptions, optsOptions }
