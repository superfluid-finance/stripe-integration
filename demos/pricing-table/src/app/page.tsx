import stripeClient from '@/lib/stripeClient';
import PricingTable from './PricingTable'

export default async function Home() {
  const products = await stripeClient.products.list().autoPagingToArray({
    limit: 50
  });
  const superfluidProducts = products.filter(p => p.metadata["superfluid"]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 dark:bg-gray-900">
      <PricingTable superfluidProducts={superfluidProducts} />
    </main>
  )
}
