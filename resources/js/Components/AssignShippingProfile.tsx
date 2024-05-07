import { useEffect, useState } from 'react'
import { lang as __ } from '@/Hooks/useLang'
import { Select } from '@/catalyst-ui/select'
import useTypedPage from '@/Hooks/useTypedPage'
import { Address, Forms, ShippingProfile } from '@/types'
import ShippingProfileForm from './ShippingProfileForm'
import InputLabel from '@/Components/TranslatedInputLabel'
import useRoute from '@/Hooks/useRoute'
import { Link } from '@inertiajs/react'
import clsx from 'clsx'

interface Props {
  shippingProfile: ShippingProfile|null
  shippingAddress?: Address|null
  renderSidebar?: () => JSX.Element
  onChange: (shippingProfile: ShippingProfile|Forms.ShippingProfileFormData|null) => void
  className?: string
}

interface PageProps {
  shippingProfiles: ShippingProfile[]
}

const AssignShippingProfile: React.FC<Props> = ({ shippingProfile, renderSidebar, onChange, className = '' }) => {

  const { shippingProfiles } = useTypedPage<PageProps>().props,
        route = useRoute(),
        [selected, setSelected] = useState<number|null>(null),
        [selectedShippingProfile, setSelectedShippingProfile] = useState<ShippingProfile|null>(null)

  useEffect(() => {

    // Use custom shipping profile
    if (selected === null) {
      const customShippingProfile = !shippingProfile?.is_shared ? shippingProfile : null
      setSelectedShippingProfile(customShippingProfile)
      onChange(customShippingProfile)
      return
    }

    // Use shared shipping profile
    const selectedShippingProfile = shippingProfiles.find(({ id }) => id === selected) || null
    setSelectedShippingProfile(selectedShippingProfile)
    onChange(selectedShippingProfile)

  }, [selected])

  useEffect(() => {
    if (shippingProfile?.is_shared) {
      setSelected(shippingProfile.id)
    } else {
      setSelected(null)
    }
  }, [shippingProfile])

  return (
    <div className={clsx('flex flex-col md:flex-row gap-8', className)}>
      <div className="space-y-6 max-w-lg">
        <ShippingProfileForm
          shippingProfile={selectedShippingProfile}
          onChange={onChange} />
      </div>

      <aside className="w-full md:max-w-xs">
        {!!renderSidebar && renderSidebar?.()}
      </aside>

    </div>
  )
}

export default AssignShippingProfile
