import { lang as __ } from '@/Hooks/useLang'
import ModelTable, { ModelPagination } from '@/Components/ModelTable'
import { ShippingProfile } from '@/types'
import Dropdown from '@/Components/Dropdown'
import { EllipsisVerticalIcon, PencilSquareIcon, TruckIcon } from '@heroicons/react/24/outline'
import DropdownLink from '@/Components/DropdownLink'
import useRoute from '@/Hooks/useRoute'
import { Link, router } from '@inertiajs/react'
import EmptyState from '@/Components/EmptyState'

const ShippingProfileTable: React.FC<{ shippingProfiles: ModelPagination<ShippingProfile> }> = ({ shippingProfiles }) => {

  const route = useRoute()

  return (
    <div>
      {shippingProfiles.total === 0 && (
        <EmptyState
          onClick={() => router.visit(route('dashboard.shipping-profiles.create'))}
          title={__('No Shipping Profiles yet')}
          icon={() => <TruckIcon className="h-12 w-auto text-primary-500" />}
          description={__('Add a shipping profile to reuse accross your products.')}
          buttonText={__('Create Shipping Profile')} />
      )}

      <ModelTable
        titles={{
          name: {
            label: __('Name'),
            value: (item) => <Link href={route('dashboard.shipping-profiles.edit', [item])}>{item.name}</Link>,
          },
          weight: {
            label: __('Weight'),
            value: (item) => !item.weight ? '' : `${item.weight} ${item.weight_unit}`,
          },
          dimensions: {
            label: __('Dimensions'),
            value: (item) => !item.width ? '' : `${item.length} x ${item.width} x ${item.height} ${item.length_unit}`,
          },
        }}
        pagination={shippingProfiles}
        actions={(item) => (
          <div className="relative">
            <Dropdown
              right
              className="w-40"
              renderTrigger={() => (
                <span className="inline-flex px-1 hover:cursor-pointer">
                  <EllipsisVerticalIcon className="w-5 h-auto" />
                </span>
              )}
            >
              <DropdownLink href={route('dashboard.shipping-profiles.edit', [item])}>
                <PencilSquareIcon className="h-3.5 w-auto -ml-1" />
                <span>{__('Edit')}</span>
              </DropdownLink>
            </Dropdown>
          </div>
        )}
      />

    </div>
  )
}

export default ShippingProfileTable
