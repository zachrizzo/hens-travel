'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MapPin, Mail, Phone, Clock, Users, Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"

const translations = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      services: "Services",
      book: "Book Now",
    },
    hero: {
      title: "Discover Paris with a Local Expert",
      subtitle: "Unforgettable tours in the City of Light",
      cta: "Book Your Tour",
    },
    about: {
      title: "About Your Guide",
      content: "Hello! I'm Sophie, your personal guide to the wonders of Paris. With over 10 years of experience, I'm passionate about sharing the city's rich history, hidden gems, and vibrant culture with visitors from around the world.",
    },
    services: {
      title: "Our Tours",
      tour1: "Classic Paris Highlights",
      tour2: "Hidden Gems of Montmartre",
      tour3: "Louvre Masterpieces",
      tour4: "Seine River Cruise",
    },
    booking: {
      title: "Book Your Parisian Adventure",
      name: "Your Name",
      email: "Your Email",
      date: "Select Date",
      tour: "Select Tour",
      message: "Special Requests",
      submit: "Book Now",
      duration: "Duration",
      groupSize: "Group Size",
      price: "Price",
    },
    footer: {
      rights: "All rights reserved",
    },
  },
  pt: {
    nav: {
      home: "Início",
      about: "Sobre",
      services: "Serviços",
      book: "Reserve Agora",
    },
    hero: {
      title: "Descubra Paris com um Especialista Local",
      subtitle: "Tours inesquecíveis na Cidade Luz",
      cta: "Reserve Seu Tour",
    },
    about: {
      title: "Sobre Seu Guia",
      content: "Olá! Eu sou Sophie, sua guia pessoal para as maravilhas de Paris. Com mais de 10 anos de experiência, sou apaixonada por compartilhar a rica história da cidade, suas joias escondidas e cultura vibrante com visitantes de todo o mundo.",
    },
    services: {
      title: "Nossos Tours",
      tour1: "Destaques Clássicos de Paris",
      tour2: "Joias Escondidas de Montmartre",
      tour3: "Obras-Primas do Louvre",
      tour4: "Cruzeiro no Rio Sena",
    },
    booking: {
      title: "Reserve Sua Aventura Parisiense",
      name: "Seu Nome",
      email: "Seu Email",
      date: "Selecione a Data",
      tour: "Selecione o Tour",
      message: "Pedidos Especiais",
      submit: "Reserve Agora",
      duration: "Duração",
      groupSize: "Tamanho do Grupo",
      price: "Preço",
    },
    footer: {
      rights: "Todos os direitos reservados",
    },
  },
}

export function LandingPageComponent() {
  const [lang, setLang] = useState('en')
  const t = translations[lang]
  const [date, setDate] = useState()

  return (
    (<div className="flex flex-col min-h-screen bg-gray-50">
      <header
        className="bg-primary text-primary-foreground py-4 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#home" className="hover:underline">{t.nav.home}</a></li>
              <li><a href="#about" className="hover:underline">{t.nav.about}</a></li>
              <li><a href="#services" className="hover:underline">{t.nav.services}</a></li>
              <li><a href="#book" className="hover:underline">{t.nav.book}</a></li>
            </ul>
          </nav>
          <Select onValueChange={(value) => setLang(value)} defaultValue={lang}>
            <SelectTrigger className="w-[130px] bg-primary-foreground text-primary">
              <SelectValue placeholder="Language" />
              <ChevronDown className="h-4 w-4 opacity-50" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                <span className="flex items-center">
                  <img
                    src="/placeholder.svg?text=EN&width=20&height=20"
                    alt="English"
                    className="w-5 h-5 mr-2 rounded-full" />
                  English
                </span>
              </SelectItem>
              <SelectItem value="pt">
                <span className="flex items-center">
                  <img
                    src="/placeholder.svg?text=PT&width=20&height=20"
                    alt="Português"
                    className="w-5 h-5 mr-2 rounded-full" />
                  Português
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>
      <main>
        <section
          id="home"
          className="relative bg-cover bg-center py-32"
          style={{backgroundImage: 'url("/placeholder.svg?height=600&width=1200")'}}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="container mx-auto text-center relative z-10">
            <h1 className="text-5xl font-bold mb-4 text-white">{t.hero.title}</h1>
            <p className="text-xl mb-8 text-gray-200">{t.hero.subtitle}</p>
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <a href="#book">{t.hero.cta}</a>
            </Button>
          </div>
        </section>

        <section id="about" className="py-20">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">{t.about.title}</h2>
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <img
                  src="/placeholder.svg?height=400&width=400"
                  alt="Tour Guide"
                  className="rounded-full mx-auto shadow-lg"
                  width={400}
                  height={400} />
              </div>
              <div className="md:w-1/2">
                <p className="text-xl leading-relaxed">{t.about.content}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="bg-muted py-20">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">{t.services.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[t.services.tour1, t.services.tour2, t.services.tour3, t.services.tour4].map((tour, index) => (
                <Card
                  key={index}
                  className="overflow-hidden transition-transform duration-300 hover:scale-105">
                  <img
                    src={`/placeholder.svg?height=200&width=400&text=Tour ${index + 1}`}
                    alt={tour}
                    className="w-full h-48 object-cover" />
                  <CardHeader>
                    <CardTitle>{tour}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Experience the magic of Paris with our expert-guided tour.</p>
                    <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                      <span className="flex items-center"><Clock className="mr-1 h-4 w-4" /> 3 hours</span>
                      <span className="flex items-center"><Users className="mr-1 h-4 w-4" /> Up to 10 people</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="book" className="py-20">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">{t.booking.title}</h2>
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="classic">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="classic">{t.services.tour1}</TabsTrigger>
                  <TabsTrigger value="montmartre">{t.services.tour2}</TabsTrigger>
                  <TabsTrigger value="louvre">{t.services.tour3}</TabsTrigger>
                  <TabsTrigger value="seine">{t.services.tour4}</TabsTrigger>
                </TabsList>
                {['classic', 'montmartre', 'louvre', 'seine'].map((tour, index) => (
                  <TabsContent key={tour} value={tour}>
                    <Card>
                      <CardHeader>
                        <CardTitle>{t.services[`tour${index + 1}`]}</CardTitle>
                        <CardDescription>Book your unforgettable Paris experience</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`${tour}-name`}>{t.booking.name}</Label>
                              <Input id={`${tour}-name`} required />
                            </div>
                            <div>
                              <Label htmlFor={`${tour}-email`}>{t.booking.email}</Label>
                              <Input id={`${tour}-email`} type="email" required />
                            </div>
                          </div>
                          <div>
                            <Label>{t.booking.date}</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}>
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {date ? format(date, "PPP") : t.booking.date}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div>
                            <Label htmlFor={`${tour}-message`}>{t.booking.message}</Label>
                            <Textarea id={`${tour}-message`} />
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-muted-foreground">{t.booking.duration}: 3 hours</p>
                              <p className="text-sm text-muted-foreground">{t.booking.groupSize}: Up to 10</p>
                              <p className="text-lg font-semibold">{t.booking.price}: €99 per person</p>
                            </div>
                            <Button type="submit">{t.booking.submit}</Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-primary text-primary-foreground py-12 mt-auto">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4">Paris Tours</h3>
            <p>&copy; 2024 Paris Tours. {t.footer.rights}.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Contact Us</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPin className="mr-2" size={18} />
                <span>123 Rue de Paris, 75001 Paris, France</span>
              </div>
              <div className="flex items-center">
                <Mail className="mr-2" size={18} />
                <a href="mailto:contact@paristours.com" className="hover:underline">contact@paristours.com</a>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2" size={18} />
                <a href="tel:+33123456789" className="hover:underline">+33 1 23 45 67 89</a>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-accent">Facebook</a>
              <a href="#" className="hover:text-accent">Instagram</a>
              <a href="#" className="hover:text-accent">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>)
  );
}