import { lang as __ } from '@/Hooks/useLang'
import { useForm } from '@inertiajs/react'
import { Forms, Order, OrderProduct, ShippingProfile } from '@/types'
import useRoute from '@/Hooks/useRoute'
import PrimaryButton from '@/Components/Buttons/PrimaryButton'
import AssignShippingProfile from './AssignShippingProfile'
import ActionMessage from '@/Components/ActionMessage'
import ValidationErrors from '@/Components/ValidationErrors'
import useTypedPage from '@/Hooks/useTypedPage'
import Heading from '@/Components/TranslatedHeading'
import ShippingOptionSelect from './ShippingOptionSelect'

interface Props {
  shippable: OrderProduct
}

const UpdateShippableShippingProfile: React.FC<Props> = ({ shippable }) => {

  const { errors } = useTypedPage<{ errors: any }>().props,
        route = useRoute(),
        shippingProfile = shippable.shipping_profile || shippable.product.shipping_profile

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    form.put(route('dashboard.shipping-profiles.assign', [shippable.id]))
  }

  const form = useForm<{
    shipping_profile_data: ShippingProfile|Forms.ShippingProfileFormData|null
    shipping_option_id: number|null
  }>({
    shipping_profile_data: null,
    shipping_option_id: shippable.shipping_option_id
  })

  return (
    <div key={shippable.id}>
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div className="flex items-center gap-x-1">
          <Heading title={__('Confirm shipment details for:')} type="h4" disableTranslationsEditor />
          <Heading title={'"'+shippable.product.name+'"'} type="h4" disableTranslationsEditor/>

          <div className="ml-auto flex items-center gap-x-4">
            <ActionMessage
              on={form.recentlySuccessful}
              className="mr-3"
            >
              {__('Saved.')}
            </ActionMessage>

            <ValidationErrors errors={errors} />

            <PrimaryButton
              type="submit"
              processing={form.processing}
              text={__('Save')} />
          </div>
        </div>

        <AssignShippingProfile
          shippingProfile={shippingProfile}
          onChange={data => form.setData('shipping_profile_data', data)}
          renderSidebar={() => <>
            <ShippingOptionSelect
              shippable={shippable}
              shippingProfile={shippingProfile}
              onChange={shippingOption => form.setData('shipping_option_id', shippingOption?.id || null)}
            />
          </>} />

      </form>
    </div>
  )
}

export default UpdateShippableShippingProfile
