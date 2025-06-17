"use client"

import Image from 'next/image'
import { SearchForm } from '@/components/search-form'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'

export function SiteHeader() {
  return (
    <header className="flex sticky top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-14 w-full items-center gap-2 px-4">
        <Image 
          src="/wzl_logo.svg" 
          alt="WZL Logo" 
          width={127} 
          height={32}
          className="h-8 w-auto"
        />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                Building Your Application
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  )
}