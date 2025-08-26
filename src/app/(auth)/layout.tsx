import { ShieldCheck } from 'lucide-react'

import KeyVaultifyTerminal from '@/components/terminal/keyvaultify-terminal'

export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-[60%] relative">
        <div className="absolute flex flex-row justify-between items-center py-4 px-6">
          <h1 className="font-spectral text-xl font-semibold flex flex-row items-center justify-center gap-[4px]">
            <ShieldCheck />
            Keyvaultify
          </h1>
        </div>
        <div className="flex h-screen justify-center items-center">
          {children}
        </div>
      </div>
      <div className="flex w-[40%] bg-[#F2F0EF] h-full">
        <KeyVaultifyTerminal theme="light" />
      </div>
    </div>
  )
}
