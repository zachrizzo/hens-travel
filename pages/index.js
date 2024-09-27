'use client'

import { useState, useEffect } from 'react'
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
import { db } from '@/firebase/firebaseConfig'
import { collection, addDoc, Timestamp, getDocs, doc, getDoc } from "firebase/firestore"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

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
    },
    booking: {
      title: "Book Your Parisian Adventure",
      name: "Your Name",
      email: "Your Email",
      date: "Select Date",
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
    },
    booking: {
      title: "Reserve Sua Aventura Parisiense",
      name: "Seu Nome",
      email: "Seu Email",
      date: "Selecione a Data",
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

export default function LandingPage() {
  const [lang, setLang] = useState('en')
  const t = translations[lang]
  const [date, setDate] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    date: null,
  })
  const [status, setStatus] = useState({
    loading: false,
    success: null,
    error: null,
  })
  const router = useRouter()

  const { user, loading, logout } = useAuth()

  // State for managing tours
  const [tours, setTours] = useState([])
  const [loadingTours, setLoadingTours] = useState(true)
  const [toursError, setToursError] = useState(null)

  // State for home content
  const [homeContent, setHomeContent] = useState(null)
  const [homeContentLoading, setHomeContentLoading] = useState(true)
  const [homeContentError, setHomeContentError] = useState(null)

  const handleLogin = () => {
    if (user) {
      router.push('/admin')
    } else {
      router.push('/admin/login')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }

  // Fetch tours from Firestore
  useEffect(() => {
    const fetchTours = async () => {
      setLoadingTours(true)
      setToursError(null)
      try {
        const toursCollection = collection(db, "tours")
        const tourSnapshot = await getDocs(toursCollection)
        const toursData = tourSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        setTours(toursData)
      } catch (error) {
        console.error("Error fetching tours: ", error)
        setToursError("Failed to load tours.")
      } finally {
        setLoadingTours(false)
      }
    }

    fetchTours()
  }, [])

  // Fetch home content from Firestore
  useEffect(() => {
    const fetchHomeContent = async () => {
      setHomeContentLoading(true)
      try {
        const docRef = doc(db, 'siteContent', 'homePage')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setHomeContent(docSnap.data())
        } else {
          console.log("No such document!")
        }
      } catch (error) {
        console.error("Error fetching home content: ", error)
        setHomeContentError("Failed to load home content.")
      } finally {
        setHomeContentLoading(false)
      }
    }
    fetchHomeContent()
  }, [])

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }))
  }

  // Handle date selection
  const handleDateChange = (selectedDate) => {
    setDate(selectedDate)
    setFormData(prev => ({
      ...prev,
      date: selectedDate,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e, tourId) => {
    e.preventDefault()
    setStatus({ loading: true, success: null, error: null })

    try {
      // Find the selected tour by id
      const selectedTour = tours.find(tour => tour.id === tourId)
      if (!selectedTour) {
        throw new Error("Selected tour not found.")
      }

      await addDoc(collection(db, "bookings"), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        tourId: tourId,
        tourName: selectedTour[`name_${lang}`], // Store the name in current language
        date: formData.date ? Timestamp.fromDate(new Date(formData.date)) : null,
        createdAt: Timestamp.now(),
      })
      setStatus({ loading: false, success: "Booking successful!", error: null })
      // Reset form
      setFormData({
        name: '',
        email: '',
        message: '',
        date: null,
      })
      setDate(null)
    } catch (error) {
      console.error("Error adding document: ", error)
      setStatus({ loading: false, success: null, error: "Failed to book. Please try again." })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#home" className="hover:underline">{t.nav.home}</a></li>
              <li><a href="#about" className="hover:underline">{t.nav.about}</a></li>
              <li><a href="#services" className="hover:underline">{t.nav.services}</a></li>
              <li><a href="#book" className="hover:underline">{t.nav.book}</a></li>
            </ul>
          </nav>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  variant="outline"
                  className="bg-primary-foreground text-primary"
                  onClick={() => router.push('/admin')}
                >
                  Admin Page
                </Button>
                <Button
                  variant="outline"
                  className="bg-primary-foreground text-primary"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="bg-primary-foreground text-primary"
                onClick={handleLogin}
              >
                Login
              </Button>
            )}
            <Select onValueChange={(value) => setLang(value)} defaultValue={lang}>
              <SelectTrigger className="w-[130px] bg-primary-foreground text-primary">
                <SelectValue placeholder="Language" />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  <span className="flex items-center">
                    <img src="/placeholder.svg?text=EN&width=20&height=20" alt="English" className="w-5 h-5 mr-2 rounded-full" />
                    English
                  </span>
                </SelectItem>
                <SelectItem value="pt">
                  <span className="flex items-center">
                    <img src="/placeholder.svg?text=PT&width=20&height=20" alt="Português" className="w-5 h-5 mr-2 rounded-full" />
                    Português
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Home Section */}
        <section id="home" className="relative bg-cover bg-center py-32" style={{ backgroundImage: `url(${homeContent?.heroImageUrl || "/placeholder.svg?height=600&width=1200"})` }}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="container mx-auto text-center relative z-10">
            <h1 className="text-5xl font-bold mb-4 text-white">{homeContent ? homeContent[`heroTitle_${lang}`] : t.hero.title}</h1>
            <p className="text-xl mb-8 text-gray-200">{homeContent ? homeContent[`heroSubtitle_${lang}`] : t.hero.subtitle}</p>
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <a href="#book">{t.hero.cta}</a>
            </Button>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">
              {homeContent ? homeContent[`aboutTitle_${lang}`] : t.about.title}
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <img
                  src={homeContent?.aboutImageUrl || "/placeholder.svg?height=400&width=400"}
                  alt="Tour Guide"
                  className="rounded-full mx-auto shadow-lg"
                  width={400}
                  height={400}
                />
              </div>
              <div className="md:w-1/2">
                <p className="text-xl leading-relaxed">
                  {homeContent ? homeContent[`aboutContent_${lang}`] : t.about.content}
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Services Section */}
        <section id="services" className="bg-muted py-20">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">{t.services.title}</h2>
            {loadingTours ? (
              <p className="text-center">Loading tours...</p>
            ) : toursError ? (
              <p className="text-center text-red-500">{toursError}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tours.map((tour) => (
                  <Card key={tour.id} className="overflow-hidden transition-transform duration-300 hover:scale-105">
                    <img src={tour.imageUrl || `/placeholder.svg?height=200&width=400&text=${encodeURIComponent(tour[`name_${lang}`] || 'Tour')}`} alt={tour[`name_${lang}`]} className="w-full h-48 object-cover" />
                    <CardHeader>
                      <CardTitle>{tour[`name_${lang}`]}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{tour[`description_${lang}`] || "Experience the magic of Paris with our expert-guided tour."}</p>
                      <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                        <span className="flex items-center"><Clock className="mr-1 h-4 w-4" /> {tour.duration}</span>
                        <span className="flex items-center"><Users className="mr-1 h-4 w-4" /> {tour.groupSize}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Booking Section */}
        <section id="book" className="py-20">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">{t.booking.title}</h2>
            <div className="max-w-4xl mx-auto">
              {loadingTours ? (
                <p className="text-center">Loading booking options...</p>
              ) : toursError ? (
                <p className="text-center text-red-500">{toursError}</p>
              ) : (
                <Tabs defaultValue={tours.length > 0 ? tours[0].id : ""}>
                  <TabsList className="grid w-full grid-cols-4">
                    {tours.map((tour) => (
                      <TabsTrigger key={tour.id} value={tour.id}>{tour[`name_${lang}`]}</TabsTrigger>
                    ))}
                  </TabsList>
                  {tours.map((tour) => (
                    <TabsContent key={tour.id} value={tour.id}>
                      <Card>
                        <CardHeader>
                          <CardTitle>{tour[`name_${lang}`]}</CardTitle>
                          <CardDescription>{t.booking.title}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form className="space-y-4" onSubmit={(e) => handleSubmit(e, tour.id)}>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="name">{t.booking.name}</Label>
                                <Input
                                  id="name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="email">{t.booking.email}</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <Label>{t.booking.date}</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : t.booking.date}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={handleDateChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div>
                              <Label htmlFor="message">{t.booking.message}</Label>
                              <Textarea
                                id="message"
                                value={formData.message}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-muted-foreground">{t.booking.duration}: {tour.duration}</p>
                                <p className="text-sm text-muted-foreground">{t.booking.groupSize}: {tour.groupSize}</p>
                                <p className="text-lg font-semibold">{t.booking.price}: {tour.price}</p>
                              </div>
                              <Button type="submit" disabled={status.loading}>
                                {status.loading ? "Submitting..." : t.booking.submit}
                              </Button>
                            </div>
                            {/* Display Success or Error Messages */}
                            {status.success && <p className="text-green-500">{status.success}</p>}
                            {status.error && <p className="text-red-500">{status.error}</p>}
                          </form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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
    </div>
  )
}
