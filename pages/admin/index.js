'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Edit, Image as ImageIcon, LogOut, Home } from 'lucide-react'
import { db, storage } from '@/firebase/firebaseConfig'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function AdminDashboard() {
    const { user, loading, logout } = useAuth()
    const router = useRouter()

    // State for tours
    const [tours, setTours] = useState([])
    const [newTour, setNewTour] = useState({
        name_en: '',
        name_pt: '',
        description_en: '',
        description_pt: '',
        duration: '',
        price: '',
        groupSize: '',
        imageUrl: '',
    })
    const [editingTourId, setEditingTourId] = useState(null)
    const [imageFile, setImageFile] = useState(null)

    // State for home content
    const [homeContent, setHomeContent] = useState({
        heroTitle_en: '',
        heroTitle_pt: '',
        heroSubtitle_en: '',
        heroSubtitle_pt: '',
        aboutTitle_en: '',
        aboutTitle_pt: '',
        aboutContent_en: '',
        aboutContent_pt: '',
        heroImageUrl: '',
        aboutImageUrl: '', // New field for About section image
    })
    const [homeImageFile, setHomeImageFile] = useState(null)
    const [aboutImageFile, setAboutImageFile] = useState(null) // New state for About image

    // State for bookings
    const [bookings, setBookings] = useState([])

    useEffect(() => {
        if (!loading && !user) {
            router.push('/')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (user) {
            fetchTours()
            fetchHomeContent()
            fetchBookings()
        }
    }, [user])

    // Fetch tours from Firestore
    const fetchTours = async () => {
        try {
            const toursCollection = collection(db, "tours")
            const tourSnapshot = await getDocs(toursCollection)
            const toursList = tourSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setTours(toursList)
        } catch (error) {
            toast.error("Failed to fetch tours.")
            console.error("Error fetching tours: ", error)
        }
    }

    // Fetch home page content from Firestore
    const fetchHomeContent = async () => {
        try {
            const docRef = doc(db, 'siteContent', 'homePage')
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                setHomeContent(docSnap.data())
            } else {
                console.log("No such document!")
            }
        } catch (error) {
            toast.error("Failed to fetch home page content.")
            console.error("Error fetching home content: ", error)
        }
    }

    // Fetch bookings from Firestore
    const fetchBookings = async () => {
        try {
            const bookingsCollection = collection(db, "bookings")
            const bookingSnapshot = await getDocs(bookingsCollection)
            const bookingsList = bookingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setBookings(bookingsList)
        } catch (error) {
            toast.error("Failed to fetch bookings.")
            console.error("Error fetching bookings: ", error)
        }
    }

    // Handle changes in the tours form
    const handleTourChange = (e) => {
        const { name, value } = e.target
        setNewTour(prev => ({ ...prev, [name]: value }))
    }

    // Handle image upload for tours
    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
        }
    }

    // Handle adding or updating a tour
    const handleSubmitTour = async (e) => {
        e.preventDefault()
        try {
            let imageUrl = newTour.imageUrl

            if (imageFile) {
                const imageRef = ref(storage, `tours/${Date.now()}_${imageFile.name}`)
                await uploadBytes(imageRef, imageFile)
                imageUrl = await getDownloadURL(imageRef)
            }

            const tourData = {
                ...newTour,
                price: parseFloat(newTour.price),
                imageUrl,
            }

            if (editingTourId) {
                await updateDoc(doc(db, "tours", editingTourId), tourData)
                setTours(prev => prev.map(tour => tour.id === editingTourId ? { ...tourData, id: editingTourId } : tour))
                toast.success('Tour updated successfully!')
            } else {
                const docRef = await addDoc(collection(db, "tours"), tourData)
                setTours(prev => [...prev, { ...tourData, id: docRef.id }])
                toast.success('Tour added successfully!')
            }

            resetTourForm()
        } catch (error) {
            toast.error('Failed to add/update tour.')
            console.error("Error adding/updating tour: ", error)
        }
    }

    // Reset tour form
    const resetTourForm = () => {
        setNewTour({
            name_en: '',
            name_pt: '',
            description_en: '',
            description_pt: '',
            duration: '',
            price: '',
            groupSize: '',
            imageUrl: '',
        })
        setImageFile(null)
        setEditingTourId(null)
    }

    // Handle editing a tour
    const handleEditTour = (tour) => {
        setNewTour(tour)
        setEditingTourId(tour.id)
    }

    // Handle deleting a tour
    const handleDeleteTour = async (id) => {
        if (!confirm("Are you sure you want to delete this tour?")) return
        try {
            const tour = tours.find(t => t.id === id)
            if (tour.imageUrl) {
                await deleteObject(ref(storage, tour.imageUrl))
            }
            await deleteDoc(doc(db, "tours", id))
            setTours(prev => prev.filter(tour => tour.id !== id))
            toast.success('Tour deleted successfully!')
        } catch (error) {
            toast.error('Failed to delete tour.')
            console.error("Error deleting tour: ", error)
        }
    }

    // Handle changes in the home content form
    const handleHomeContentChange = (e) => {
        const { name, value } = e.target
        setHomeContent(prev => ({ ...prev, [name]: value }))
    }

    // Handle image upload for home content
    const handleHomeImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setHomeImageFile(file)
        }
    }

    // Handle image upload for About section
    const handleAboutImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setAboutImageFile(file)
        }
    }

    // Handle updating home content
    const handleSubmitHomeContent = async (e) => {
        e.preventDefault()
        try {
            let heroImageUrl = homeContent.heroImageUrl
            let aboutImageUrl = homeContent.aboutImageUrl

            if (homeImageFile) {
                const imageRef = ref(storage, `home/hero/${Date.now()}_${homeImageFile.name}`)
                await uploadBytes(imageRef, homeImageFile)
                heroImageUrl = await getDownloadURL(imageRef)
            }

            if (aboutImageFile) {
                const imageRef = ref(storage, `home/about/${Date.now()}_${aboutImageFile.name}`)
                await uploadBytes(imageRef, aboutImageFile)
                aboutImageUrl = await getDownloadURL(imageRef)
            }

            const updatedHomeContent = {
                ...homeContent,
                heroImageUrl,
                aboutImageUrl, // Update About image URL
            }

            await setDoc(doc(db, 'siteContent', 'homePage'), updatedHomeContent)
            setHomeContent(updatedHomeContent)
            toast.success('Home page content updated successfully!')
            setHomeImageFile(null)
            setAboutImageFile(null)
        } catch (error) {
            toast.error('Failed to update home page content.')
            console.error("Error updating home content: ", error)
        }
    }

    // Handle deleting a booking
    const handleDeleteBooking = async (id) => {
        if (!confirm("Are you sure you want to delete this booking?")) return
        try {
            await deleteDoc(doc(db, "bookings", id))
            setBookings(prev => prev.filter(booking => booking.id !== id))
            toast.success('Booking deleted successfully!')
        } catch (error) {
            toast.error('Failed to delete booking.')
            console.error("Error deleting booking: ", error)
        }
    }

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout()
            router.push('/')
        } catch (error) {
            toast.error('Error logging out.')
            console.error('Error logging out:', error)
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    if (!user) {
        return null
    }

    return (
        <div className="container mx-auto p-4">
            <ToastContainer />
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold flex items-center">
                    <Home className="mr-2" /> Admin Dashboard
                </h1>
                <div className="flex space-x-4">
                    <Button onClick={() => router.push('/')} variant="outline" className="flex items-center">
                        <Home className="mr-2 h-4 w-4" /> Home
                    </Button>
                    <Button onClick={handleLogout} variant="destructive" className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </div>
            </header>

            <Tabs defaultValue="tours" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="tours">Manage Tours</TabsTrigger>
                    <TabsTrigger value="home">Home Content</TabsTrigger>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                </TabsList>

                {/* Manage Tours Tab */}
                <TabsContent value="tours">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Tours</CardTitle>
                            <CardDescription>Add, edit, or delete tours</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Tour Form */}
                            <form onSubmit={handleSubmitTour} className="space-y-4 mb-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name_en">Name (English)</Label>
                                        <Input
                                            id="name_en"
                                            name="name_en"
                                            value={newTour.name_en}
                                            onChange={handleTourChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="name_pt">Name (Portuguese)</Label>
                                        <Input
                                            id="name_pt"
                                            name="name_pt"
                                            value={newTour.name_pt}
                                            onChange={handleTourChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="description_en">Description (English)</Label>
                                        <Textarea
                                            id="description_en"
                                            name="description_en"
                                            value={newTour.description_en}
                                            onChange={handleTourChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="description_pt">Description (Portuguese)</Label>
                                        <Textarea
                                            id="description_pt"
                                            name="description_pt"
                                            value={newTour.description_pt}
                                            onChange={handleTourChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="duration">Duration</Label>
                                        <Input
                                            id="duration"
                                            name="duration"
                                            value={newTour.duration}
                                            onChange={handleTourChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="groupSize">Group Size</Label>
                                        <Input
                                            id="groupSize"
                                            name="groupSize"
                                            value={newTour.groupSize}
                                            onChange={handleTourChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="price">Price (€)</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            value={newTour.price}
                                            onChange={handleTourChange}
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="imageUrl">Image URL</Label>
                                    <Input
                                        id="imageUrl"
                                        name="imageUrl"
                                        value={newTour.imageUrl}
                                        onChange={handleTourChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="image">Upload Image</Label>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            id="image"
                                            name="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <Button type="button" variant="outline" onClick={() => document.getElementById('image')?.click()}>
                                            <ImageIcon className="mr-2 h-4 w-4" /> Upload Image
                                        </Button>
                                        {(imageFile || newTour.imageUrl) && <span className="text-sm text-muted-foreground">Image selected</span>}
                                    </div>
                                </div>
                                <Button type="submit">{editingTourId ? 'Update Tour' : 'Add Tour'}</Button>
                            </form>

                            {/* Tours Table */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name (EN)</TableHead>
                                        <TableHead>Name (PT)</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Price (€)</TableHead>
                                        <TableHead>Group Size</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tours.map((tour) => (
                                        <TableRow key={tour.id}>
                                            <TableCell>{tour.name_en}</TableCell>
                                            <TableCell>{tour.name_pt}</TableCell>
                                            <TableCell>{tour.duration}</TableCell>
                                            <TableCell>{tour.price.toFixed(2)}</TableCell>
                                            <TableCell>{tour.groupSize}</TableCell>
                                            <TableCell className="flex space-x-2">
                                                <Button variant="outline" onClick={() => handleEditTour(tour)}>
                                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                                </Button>
                                                <Button variant="destructive" onClick={() => handleDeleteTour(tour.id)}>
                                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Home Content Tab */}
                <TabsContent value="home">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Home Page Content</CardTitle>
                            <CardDescription>Update texts and main images of the home page</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitHomeContent} className="space-y-4">
                                {/* Hero Title */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="heroTitle_en">Hero Title (English)</Label>
                                        <Input
                                            id="heroTitle_en"
                                            name="heroTitle_en"
                                            value={homeContent.heroTitle_en}
                                            onChange={handleHomeContentChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="heroTitle_pt">Hero Title (Portuguese)</Label>
                                        <Input
                                            id="heroTitle_pt"
                                            name="heroTitle_pt"
                                            value={homeContent.heroTitle_pt}
                                            onChange={handleHomeContentChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Hero Subtitle */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="heroSubtitle_en">Hero Subtitle (English)</Label>
                                        <Input
                                            id="heroSubtitle_en"
                                            name="heroSubtitle_en"
                                            value={homeContent.heroSubtitle_en}
                                            onChange={handleHomeContentChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="heroSubtitle_pt">Hero Subtitle (Portuguese)</Label>
                                        <Input
                                            id="heroSubtitle_pt"
                                            name="heroSubtitle_pt"
                                            value={homeContent.heroSubtitle_pt}
                                            onChange={handleHomeContentChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* About Title */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="aboutTitle_en">About Title (English)</Label>
                                        <Input
                                            id="aboutTitle_en"
                                            name="aboutTitle_en"
                                            value={homeContent.aboutTitle_en}
                                            onChange={handleHomeContentChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="aboutTitle_pt">About Title (Portuguese)</Label>
                                        <Input
                                            id="aboutTitle_pt"
                                            name="aboutTitle_pt"
                                            value={homeContent.aboutTitle_pt}
                                            onChange={handleHomeContentChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* About Content */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="aboutContent_en">About Content (English)</Label>
                                        <Textarea
                                            id="aboutContent_en"
                                            name="aboutContent_en"
                                            value={homeContent.aboutContent_en}
                                            onChange={handleHomeContentChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="aboutContent_pt">About Content (Portuguese)</Label>
                                        <Textarea
                                            id="aboutContent_pt"
                                            name="aboutContent_pt"
                                            value={homeContent.aboutContent_pt}
                                            onChange={handleHomeContentChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Hero Image Upload */}
                                <div>
                                    <Label htmlFor="heroImage">Upload Hero Image</Label>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            id="heroImage"
                                            name="heroImage"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleHomeImageUpload}
                                            className="hidden"
                                        />
                                        <Button type="button" variant="outline" onClick={() => document.getElementById('heroImage')?.click()}>
                                            <ImageIcon className="mr-2 h-4 w-4" /> Upload Image
                                        </Button>
                                        {(homeImageFile || homeContent.heroImageUrl) && <span className="text-sm text-muted-foreground">Image selected</span>}
                                    </div>
                                    {/* Preview Hero Image */}
                                    {homeContent.heroImageUrl && (
                                        <div className="mt-2">
                                            <img src={homeContent.heroImageUrl} alt="Hero Image" className="w-32 h-32 object-cover rounded" />
                                        </div>
                                    )}
                                </div>

                                {/* About Image Upload */}
                                <div>
                                    <Label htmlFor="aboutImage">Upload About Image</Label>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            id="aboutImage"
                                            name="aboutImage"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAboutImageUpload}
                                            className="hidden"
                                        />
                                        <Button type="button" variant="outline" onClick={() => document.getElementById('aboutImage')?.click()}>
                                            <ImageIcon className="mr-2 h-4 w-4" /> Upload Image
                                        </Button>
                                        {(aboutImageFile || homeContent.aboutImageUrl) && <span className="text-sm text-muted-foreground">Image selected</span>}
                                    </div>
                                    {/* Preview About Image */}
                                    {homeContent.aboutImageUrl && (
                                        <div className="mt-2">
                                            <img src={homeContent.aboutImageUrl} alt="About Image" className="w-32 h-32 object-cover rounded" />
                                        </div>
                                    )}
                                </div>

                                <Button type="submit">Update Home Content</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bookings Tab */}
                <TabsContent value="bookings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Bookings</CardTitle>
                            <CardDescription>View and manage tour bookings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Tour</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell>{booking.name}</TableCell>
                                            <TableCell>{booking.email}</TableCell>
                                            <TableCell>{booking.tourName}</TableCell>
                                            <TableCell>{booking.date ? new Date(booking.date.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell>
                                                <Button variant="destructive" onClick={() => handleDeleteBooking(booking.id)}>
                                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
