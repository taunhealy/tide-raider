'use client'

import {NextStudio} from 'next-sanity/studio'
import config from '../../../../sanity/sanity.config'
import { Config } from 'sanity'

const studioConfig: Config = {
  ...config,
  basePath: '/studio'
}

export default function StudioPage() {
  return <NextStudio config={studioConfig} />
}