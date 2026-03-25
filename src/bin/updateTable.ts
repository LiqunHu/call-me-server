import { initDB } from '@/utils/DB'
import { dev_interface, dev_template } from '@entities/dev'

const udpateTable = async () => {
  const allTemplates = await dev_template.findBy({})

  for (const item of allTemplates) {
    const doc = JSON.parse(item.dev_template_doc)
    if (doc && doc.APIs) {
      let updateFlag = false
      for (let i = 0; i < doc.APIs.length; i++) {
        if (
          doc.APIs[i].host == 'api2.bybit.com' &&
          doc.APIs[i].intercept.url == 'v2/private/user/profile'
        ) {
          doc.APIs[i].host = 'www.bybit.com'
          doc.APIs[i].intercept.url = 'x-api/v2/private/user/profile'
          updateFlag = true
        }
      }
      if (updateFlag) {
        item.dev_template_doc = JSON.stringify(doc)
        await item.save()
      }
    }
  }

  const allInterface = await dev_interface.findBy({})
  for (const item of allInterface) {
    const doc = JSON.parse(item.dev_interface_doc)
    let updateFlag = false
    if (doc && doc.APIs) {
      for (let i = 0; i < doc.APIs.length; i++) {
        if (
          doc.APIs[i].host == 'api2.bybit.com' &&
          doc.APIs[i].intercept.url == 'v2/private/user/profile'
        ) {
          doc.APIs[i].host = 'www.bybit.com'
          doc.APIs[i].intercept.url = 'x-api/v2/private/user/profile'
          updateFlag = true
        }
      }
      if (updateFlag) {
        item.dev_interface_doc = JSON.stringify(doc)
        await item.save()
      }
    }
  }
}

;(async () => {
  await initDB()
  await udpateTable()
  process.exit(0)
})()
