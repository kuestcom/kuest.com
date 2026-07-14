export interface DeploymentRegionOption {
  id: string
  location: string
}

export const DEFAULT_VERCEL_REGION = 'dub1'
export const DEFAULT_SUPABASE_REGION = 'eu-west-1'

export const VERCEL_REGIONS: readonly DeploymentRegionOption[] = [
  { id: 'arn1', location: 'Stockholm, Sweden' },
  { id: 'bom1', location: 'Mumbai, India' },
  { id: 'cdg1', location: 'Paris, France' },
  { id: 'cle1', location: 'Cleveland, USA' },
  { id: 'cpt1', location: 'Cape Town, South Africa' },
  { id: 'dub1', location: 'Dublin, Ireland' },
  { id: 'dxb1', location: 'Dubai, United Arab Emirates' },
  { id: 'fra1', location: 'Frankfurt, Germany' },
  { id: 'gru1', location: 'São Paulo, Brazil' },
  { id: 'hkg1', location: 'Hong Kong' },
  { id: 'hnd1', location: 'Tokyo, Japan' },
  { id: 'iad1', location: 'Washington, D.C., USA' },
  { id: 'icn1', location: 'Seoul, South Korea' },
  { id: 'kix1', location: 'Osaka, Japan' },
  { id: 'lhr1', location: 'London, United Kingdom' },
  { id: 'pdx1', location: 'Portland, USA' },
  { id: 'sfo1', location: 'San Francisco, USA' },
  { id: 'sin1', location: 'Singapore' },
  { id: 'syd1', location: 'Sydney, Australia' },
  { id: 'yul1', location: 'Montréal, Canada' },
]

export const SUPABASE_REGIONS: readonly DeploymentRegionOption[] = [
  { id: 'us-west-1', location: 'West US (North California)' },
  { id: 'us-west-2', location: 'West US (Oregon)' },
  { id: 'us-east-1', location: 'East US (North Virginia)' },
  { id: 'us-east-2', location: 'East US (Ohio)' },
  { id: 'ca-central-1', location: 'Canada (Central)' },
  { id: 'eu-west-1', location: 'West EU (Ireland)' },
  { id: 'eu-west-2', location: 'West Europe (London)' },
  { id: 'eu-west-3', location: 'West EU (Paris)' },
  { id: 'eu-central-1', location: 'Central EU (Frankfurt)' },
  { id: 'eu-central-2', location: 'Central Europe (Zurich)' },
  { id: 'eu-north-1', location: 'North EU (Stockholm)' },
  { id: 'ap-south-1', location: 'South Asia (Mumbai)' },
  { id: 'ap-southeast-1', location: 'Southeast Asia (Singapore)' },
  { id: 'ap-northeast-1', location: 'Northeast Asia (Tokyo)' },
  { id: 'ap-northeast-2', location: 'Northeast Asia (Seoul)' },
  { id: 'ap-southeast-2', location: 'Oceania (Sydney)' },
  { id: 'sa-east-1', location: 'South America (São Paulo)' },
]

export function isVercelRegion(value: string) {
  return /^[a-z]{3}\d$/.test(value)
}

export function isSupabaseRegion(value: string) {
  return /^[a-z]{2}(?:-[a-z]+)+-\d$/.test(value)
}
