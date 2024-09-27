'use client';
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit, Image as ImageIcon } from 'lucide-react';

export function AdminPageComponent() {
  const [experiences, setExperiences] = useState([
    { id: 1, title: "Classic Paris Highlights", description: "Experience the iconic landmarks of Paris in this comprehensive tour.", duration: "3 hours", price: 99, image: "/placeholder.svg?text=Paris+Highlights" },
    { id: 2, title: "Hidden Gems of Montmartre", description: "Explore the charming streets and artistic heritage of Montmartre.", duration: "2 hours", price: 79, image: "/placeholder.svg?text=Montmartre" },
  ]);
  const [newExperience, setNewExperience] = useState({
    title: '',
    description: '',
    duration: '',
    price: 0,
    image: '',
  });
  const [editingId, setEditingId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExperience(
      prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value })
    );
  };

  const handleSelectChange = (value) => {
    setNewExperience(prev => ({ ...prev, duration: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real application, you would upload the file to a server here
      // and get back a URL to store in the experience object.
      // For this example, we'll just use a placeholder URL.
      setNewExperience(prev => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId !== null) {
      setExperiences(
        prev => prev.map(exp => exp.id === editingId ? { ...newExperience, id: editingId } : exp)
      );
      setEditingId(null);
    } else {
      setExperiences(prev => [...prev, { ...newExperience, id: Date.now() }]);
    }
    setNewExperience({ title: '', description: '', duration: '', price: 0, image: '' });
  };

  const handleEdit = (experience) => {
    setNewExperience(experience);
    setEditingId(experience.id);
  };

  const handleDelete = (id) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
  };

  return (
    (<div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{editingId !== null ? 'Edit Experience' : 'Add New Experience'}</CardTitle>
          <CardDescription>Enter the details of the new tour experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={newExperience.title}
                onChange={handleInputChange}
                required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={newExperience.description}
                onChange={handleInputChange}
                required />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Select onValueChange={handleSelectChange} value={newExperience.duration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                  <SelectItem value="2 hours">2 hours</SelectItem>
                  <SelectItem value="3 hours">3 hours</SelectItem>
                  <SelectItem value="4 hours">4 hours</SelectItem>
                  <SelectItem value="Full day">Full day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Price (€)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={newExperience.price}
                onChange={handleInputChange}
                required />
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
                {newExperience.image && <span className="text-sm text-muted-foreground">Image selected</span>}
              </div>
            </div>
            <Button type="submit">{editingId !== null ? 'Update Experience' : 'Add Experience'}</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Existing Experiences</CardTitle>
          <CardDescription>Manage your current tour experiences.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price (€)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiences.map((experience) => (
                <TableRow key={experience.id}>
                  <TableCell>{experience.title}</TableCell>
                  <TableCell>{experience.duration}</TableCell>
                  <TableCell>{experience.price}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(experience)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(experience.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>)
  );
}