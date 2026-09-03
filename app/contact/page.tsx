import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function Contact() {
  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='relative mx-auto mb-12 w-fit sm:mb-16 lg:mb-24'>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Me contacter</h2>
          <span className='bg-primary absolute top-9 left-0 h-px w-full'></span>
        </div>

        <div className='grid items-center gap-12 lg:grid-cols-2'>
          <Image
            src='/image-1.webp'
            alt='Contact illustration'
            className='size-full rounded-md object-cover max-lg:max-h-70'
            width={512}
            height={512}
          />

          <div>
            <h3 className='mb-6 text-2xl font-semibold'>Je serai heureux de vous aider!</h3>

            {/* Contact Info Grid */}
            <Card>
              <CardContent>
                Vous pouvez me contacter par mail à n.jullien57@gmail.com
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
