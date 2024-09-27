'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Edit, Image as ImageIcon, LogOut } from 'lucide-react'
import { db, storage } from '@/firebase/firebaseConfig'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function AdminDashboardComponent() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  const [tours, setTours] = useState([])
  const [bookings, setBookings] = useState([])
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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const toursData = await fetchCollection('tours')
      const bookingsData = await fetchCollection('bookings')
      setTours(toursData)
      setBookings(bookingsData)
    } catch (err) {
      toast.error('Failed to fetch data.')
    }
  }

  const fetchCollection = async (collectionName) => {
    const collectionRef = collection(db, collectionName)
    const snapshot = await getDocs(collectionRef)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTour(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
    }
  }

  const handleSubmit = async (e) => {
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
        setTours(prev => prev.map(
          tour => tour.id === editingTourId ? { ...tourData, id: editingTourId } : tour
        ))
        toast.success('Tour updated successfully!')
      } else {
        const docRef = await addDoc(collection(db, "tours"), tourData)
        setTours(prev => [...prev, { ...tourData, id: docRef.id }])
        toast.success('Tour added successfully!')
      }

      resetForm()
    } catch (err) {
      toast.error('Failed to add/update tour.')
    }
  }

  const resetForm = () => {
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

  const handleEdit = (tour) => {
    setNewTour(tour)
    setEditingTourId(tour.id)
  }

  const handleDelete = async (id) => {
    try {
      const tour = tours.find(t => t.id === id)
      if (tour.imageUrl) {
        await deleteObject(ref(storage, tour.imageUrl))
      }
      await deleteDoc(doc(db, "tours", id))
      setTours(prev => prev.filter(tour => tour.id !== id))
      toast.success('Tour deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete tour.')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (err) {
      toast.error('Error logging out.')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null
  }

  return (
    (<div className="container mx-auto py-8 px-4">
      <ToastContainer />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
      <Tabs defaultValue="tours" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tours">Manage Tours</TabsTrigger>
          <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="tours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{editingTourId ? 'Edit Tour' : 'Add New Tour'}</CardTitle>
              <CardDescription>Enter the details of the tour.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name_en">Title (English)</Label>
                    <Input
                      id="name_en"
                      name="name_en"
                      value={newTour.name_en}
                      onChange={handleInputChange}
                      required />
                  </div>
                  <div>
                    <Label htmlFor="name_pt">Title (Portuguese)</Label>
                    <Input
                      id="name_pt"
                      name="name_pt"
                      value={newTour.name_pt}
                      onChange={handleInputChange}
                      required />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description_en">Description (English)</Label>
                    <Textarea
                      id="description_en"
                      name="description_en"
                      value={newTour.description_en}
                      onChange={handleInputChange}
                      required />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description_pt">Description (Portuguese)</Label>
                    <Textarea
                      id="description_pt"
                      name="description_pt"
                      value={newTour.description_pt}
                      onChange={handleInputChange}
                      required />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={newTour.duration}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., 3 hours" />
                  </div>
                  <div>
                    <Label htmlFor="groupSize">Group Size</Label>
                    <Input
                      id="groupSize"
                      name="groupSize"
                      value={newTour.groupSize}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., 10 people" />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (€)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={newTour.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01" />
                  </div>
                  <div>
                    <Label htmlFor="image">Image</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image')?.click()}>
                        <ImageIcon className="mr-2 h-4 w-4" /> Upload Image
                      </Button>
                      {(imageFile || newTour.imageUrl) && <span className="text-sm text-muted-foreground">Image selected</span>}
                    </div>
                  </div>
                </div>
                <Button type="submit">{editingTourId ? 'Update Tour' : 'Add Tour'}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Tours</CardTitle>
              <CardDescription>Manage your current tours.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title (EN)</TableHead>
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
                        <TableCell>{tour.duration}</TableCell>
                        <TableCell>{tour.price}</TableCell>
                        <TableCell>{tour.groupSize}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(tour)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleDelete(tour.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking Requests</CardTitle>
              <CardDescription>View and manage booking requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tour</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.name}</TableCell>
                        <TableCell>{booking.email}</TableCell>
                        <TableCell>{booking.tourName}</TableCell>
                        <TableCell>{booking.date ? new Date(booking.date.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{booking.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>)
  );
}