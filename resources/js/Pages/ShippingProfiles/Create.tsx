import { lang as __ } from '@/Hooks/useLang'
import { useForm } from '@inertiajs/react'
import useRoute from '@/Hooks/useRoute'
import OrdersTabLayout from '@/Pages/Dashboard/Orders/Partials/OrdersTabLayout'
import InputLabel from '@/Components/TranslatedInputLabel'
import { Input } from '@/catalyst-ui/input'
import InputError from '@/Components/InputError'
import PrimaryButton from '@/Components/Buttons/PrimaryButton'
import FormSection from '@/Components/FormSection'
import ActionMessage from '@/Components/ActionMessage'

const Create: React.FC = () => {

  const form = useForm<{ name: string|null }>({ name: null }),
        route = useRoute(),
        createShippingProfile = () => {
          form.post(route('dashboard.shipping-profiles.store'), {
            preserveScroll: true,
          })
        }

  return (
    <OrdersTabLayout title={__('Edit Shipping Profile')}>
      <FormSection
        onSubmit={createShippingProfile}
        title={__('New Shipping Profile')}
        description={__('What would you like to name your new shipping profile?')}
        renderActions={() => (
          <>
            <ActionMessage on={form.recentlySuccessful} className="mr-3">
              {__('Saved')}
            </ActionMessage>

            <PrimaryButton
              disabled={form.processing}
              text={__('Continue')} />
          </>
      )}>
        <div className="col-span-6 md:col-span-4">
          <fieldset className="space-y-1">
            <InputLabel lang="shipping_profiles.name" value="Name" />
            <Input
              value={form.data.name || ''}
              onChange={event => form.setData('name', event.target.value)}
              className="w-full" />
            <InputError message={form.errors.name} />
          </fieldset>
        </div>
      </FormSection>
    </OrdersTabLayout>
  )
}

export default Create
