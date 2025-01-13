import {seedDefaultPages} from '../utils/seedPages'

seedDefaultPages()
  .then(() => {
    console.log('Seeding completed successfully')
    process.exit(0)
  })
  .catch(error => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })