import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
    WalletIcon, UserIcon, Mail, Globe, Save, FileText, Trash2, Pencil, Check, X, Eye,
    GripHorizontal, Upload, CreditCard, FileIcon, AlertCircle,
    Contact,
    MapPin,
    Cake
} from 'lucide-react';
import { IconBrandGithub, IconBrandTwitter, IconBrandLinkedin } from '@tabler/icons-react';
import { z } from 'zod';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import Welcome from './Welcome';
import { useNavigate } from "react-router-dom"
import useAuthStore from "../store/authStore"

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().email('Invalid email address'),
    website: z.string().url('Invalid URL').or(z.literal('')),
    linkedin: z.string().url('Invalid LinkedIn URL').or(z.literal('')),
    twitter: z.string().url('Invalid Twitter URL').or(z.literal('')),
    github: z.string().url('Invalid GitHub URL').or(z.literal('')),
    ethWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid ETH wallet address').or(z.literal('')),
    btcWallet: z.string().regex(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/, 'Invalid BTC wallet address').or(z.literal(''))
});

const ProfileCard = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', website: '', linkedin: '',
        twitter: '', github: '', ethWallet: '', btcWallet: ''
    });
    const [errors, setErrors] = useState({});
    const [documents, setDocuments] = useState([]);
    const [ids, setIds] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [newFileName, setNewFileName] = useState('');
    const [draggedFile, setDraggedFile] = useState(null);
    const dragTimeoutRef = useRef(null);
    const navigate = useNavigate()
    const logout = useAuthStore((state) => state.logout)

    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.sync.get(['profile'], result => {
                if (result.profile) {
                    setFormData(prev => ({ ...prev, ...result.profile }));
                }
            });
        }
    }, []);

    const handleDocumentUpload = (event, type) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newDoc = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    size: (file.size / 1024).toFixed(2) + ' KB',
                    type: file.type,
                    category: type,
                    date: new Date().toLocaleDateString(),
                    content: e.target.result
                };

                if (type === 'document') {
                    setDocuments([...documents, newDoc]);
                } else {
                    setIds([...ids, newDoc]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragStart = (e, file) => {
        setDraggedFile(file);

        const dragPreview = document.createElement('div');
        dragPreview.className = 'bg-white shadow-lg rounded-lg p-2 border';
        dragPreview.innerHTML = `
      <div class="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span>${file.name}</span>
      </div>
    `;
        document.body.appendChild(dragPreview);

        const blob = dataURItoBlob(file.content);
        const dragData = [new File([blob], file.name, { type: file.type })];
        e.dataTransfer.setDragImage(dragPreview, 10, 10);
        e.dataTransfer.setData('text/plain', file.name);
        e.dataTransfer.setData('text/uri-list', file.content);
        e.dataTransfer.effectAllowed = 'copy';

        if (!dragTimeoutRef.current) {
            const link = document.createElement('a');
            link.href = file.content;
            link.download = file.name;
            document.body.appendChild(link);
            dragTimeoutRef.current = link;
        }

        e.target.addEventListener('dragend', () => {
            document.body.removeChild(dragPreview);
            if (dragTimeoutRef.current) {
                document.body.removeChild(dragTimeoutRef.current);
                dragTimeoutRef.current = null;
            }
        }, { once: true });
    };

    const dataURItoBlob = (dataURI) => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: mimeString });
    };

    const removeFile = (id, type) => {
        if (type === 'document') {
            setDocuments(documents.filter(doc => doc.id !== id));
        } else {
            setIds(ids.filter(idDoc => idDoc.id !== id));
        }
    };

    const startRename = (file) => {
        setEditingId(file.id);
        setNewFileName(file.name);
    };

    const handleRename = (id, type) => {
        const updateFiles = (files) =>
            files.map(file =>
                file.id === id ? { ...file, name: newFileName } : file
            );

        if (type === 'document') {
            setDocuments(updateFiles(documents));
        } else {
            setIds(updateFiles(ids));
        }
        setEditingId(null);
    };

    const cancelRename = () => {
        setEditingId(null);
        setNewFileName('');
    };

    const PreviewDialog = ({ file }) => {
        const isImage = file.type.startsWith('image/');
        const isPDF = file.type === 'application/pdf';

        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 text-blue-500" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{file.name}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        {isImage ? (
                            <img
                                src={file.content}
                                alt={file.name}
                                className="max-w-full h-auto"
                            />
                        ) : isPDF ? (
                            <iframe
                                src={file.content}
                                className="w-full h-[70vh]"
                                title={file.name}
                            />
                        ) : (
                            <div className="p-4 bg-gray-100 rounded">
                                <p>Preview not available for this file type</p>
                                <p className="text-sm text-gray-500 mt-2">File type: {file.type}</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    const FileCard = ({ file, type }) => {
        const isEditing = editingId === file.id;

        return (
            <div
                className={`flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors
          ${draggedFile?.id === file.id ? 'opacity-50' : ''}`}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, file)}
            >
                <div className="flex items-center space-x-2 flex-grow min-w-0">
                    <GripHorizontal className="w-4 h-4 text-gray-400 cursor-grab" />
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0 flex-grow">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    value={newFileName}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    className="h-6 text-sm"
                                    autoFocus
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRename(file.id, type)}
                                >
                                    <Check className="w-4 h-4 text-green-500" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={cancelRename}
                                >
                                    <X className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        ) : (
                            <p className="text-sm font-medium truncate">{file.name}</p>
                        )}
                        <p className="text-xs text-gray-500">{file.size} • {file.date}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0">
                    <PreviewDialog file={file} />
                    {!isEditing && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startRename(file)}
                        >
                            <Pencil className="w-4 h-4 text-gray-500" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id, type)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    };

    const FileList = ({ files, type }) => (
        <div className="space-y-2">
            {files.map((file) => (
                <FileCard
                    key={file.id}
                    file={file}
                    type={type}
                />
            ))}
        </div>
    );

    const handleInputChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSave = () => {
        try {
            const validatedData = profileSchema.parse(formData);

            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.sync.set({ profile: validatedData }, () => {
                    if (chrome.runtime.lastError) {
                        alert('Error saving profile: ' + chrome.runtime.lastError.message);
                    } else {
                        alert('Profile saved successfully!');
                    }
                });
            } else {
                console.log('Development mode - Profile data:', validatedData);
                alert('Development mode - Profile would be saved in extension environment');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors = {};
                error.errors.forEach(err => {
                    newErrors[err.path[0]] = err.message;
                });
                setErrors(newErrors);
                alert('Please fix the validation errors before saving.');
            }
        }
    };

    const ErrorMessage = ({ field }) => (
        errors[field] ? <span className="text-sm text-destructive">{errors[field]}</span> : null
    );

    const handleLogout = () => {
        logout()
        navigate("/")
    }

    return (
        <>
        <Welcome />
        <div className='p-3 '>
            <Tabs defaultValue="personal" className="w-full">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="border-b">
                    <TabsList className="inline-flex w-full min-w-max h-auto">
                        <TabsTrigger value="personal" className="min-w-[100px] p-2">
                            <UserIcon className="w-4 h-4 mr-2" />
                            Personal
                        </TabsTrigger>
                        <TabsTrigger value="social" className="min-w-[100px] p-2">
                            <Globe className="w-4 h-4 mr-2" />
                            Social
                        </TabsTrigger>
                        <TabsTrigger value="crypto" className="min-w-[100px] p-2">
                            <WalletIcon className="w-4 h-4 mr-2" />
                            Crypto
                        </TabsTrigger>
                        <TabsTrigger value="wallet" className="min-w-[100px] p-2">
                            <FileText className="w-4 h-4 mr-2" />
                            Wallet
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="min-w-[100px] p-2">
                            <FileText className="w-4 h-4 mr-2" />
                            Documents
                        </TabsTrigger>
                    </TabsList>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <div className="flex-grow h-[calc(100vh-120px)] overflow-hidden">
            <ScrollArea className="h-full w-full">
                <TabsContent value="personal">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <UserIcon className="w-4 h-4" />
                                    Full Name
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleInputChange('name')}
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                <ErrorMessage field="name" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </Label>
                                <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange('email')}
                                    className={errors.email ? 'border-destructive' : ''}
                                />
                                <ErrorMessage field="email" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Website
                                </Label>
                                <Input
                                    type="url"
                                    placeholder="https://yourwebsite.com"
                                    value={formData.website}
                                    onChange={handleInputChange('website')}
                                    className={errors.website ? 'border-destructive' : ''}
                                />
                                <ErrorMessage field="website" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Contact className="w-4 h-4" />
                                    Phone Number
                                </Label>
                                <Input
                                    type="tel"
                                    placeholder="9203999949"
                                    // value={formData.website}
                                    // onChange={handleInputChange('website')}
                                    // className={errors.website ? 'border-destructive' : ''}
                                />
                                {/* <ErrorMessage field="website" /> */}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Address
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="1234 Main St, Anytown, USA"
                                    // value={formData.address}
                                    // onChange={handleInputChange('address')}
                                    // className={errors.address ? 'border-destructive' : ''}
                                />
                                {/* <ErrorMessage field="address" /> */}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Cake className="w-4 h-4" />
                                    Date of Birth
                                </Label>
                                <Input
                                    type="date"
                                    // value={formData.dob}
                                    // onChange={handleInputChange('dob')}
                                    // className={errors.dob ? 'border-destructive' : ''}
                                />
                                {/* <ErrorMessage field="dob" /> */}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="flex items-center gap-2" onClick={handleSave}>
                                <Save className="w-4 h-4" />
                                Save Profile
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="social">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">Social Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <IconBrandLinkedin className="w-4 h-4" />
                                    LinkedIn
                                </Label>
                                <Input
                                    type="url"
                                    placeholder="https://linkedin.com/in/username"
                                    value={formData.linkedin}
                                    onChange={handleInputChange('linkedin')}
                                    className={errors.linkedin ? 'border-destructive' : ''}
                                />
                                <ErrorMessage field="linkedin" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <IconBrandTwitter className="w-4 h-4" />
                                    Twitter
                                </Label>
                                <Input
                                    type="url"
                                    placeholder="https://twitter.com/username"
                                    value={formData.twitter}
                                    onChange={handleInputChange('twitter')}
                                    className={errors.twitter ? 'border-destructive' : ''}
                                />
                                <ErrorMessage field="twitter" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <IconBrandGithub className="w-4 h-4" />
                                    GitHub
                                </Label>
                                <Input
                                    type="url"
                                    placeholder="https://github.com/username"
                                    value={formData.github}
                                    onChange={handleInputChange('github')}
                                    className={errors.github ? 'border-destructive' : ''}
                                />
                                <ErrorMessage field="github" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="flex items-center gap-2" onClick={handleSave}>
                                <Save className="w-4 h-4" />
                                Save Links
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="crypto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">Crypto Wallets</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <WalletIcon className="w-4 h-4" />
                                    ETH Wallet
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="0x..."
                                    value={formData.ethWallet}
                                    onChange={handleInputChange('ethWallet')}
                                    className={errors.ethWallet ? 'border-destructive' : ''}
                                />
                                <ErrorMessage field="ethWallet" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <WalletIcon className="w-4 h-4" />
                                    BTC Wallet
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="bc1..."
                                    value={formData.btcWallet}
                                    onChange={handleInputChange('btcWallet')}
                                    className={errors.btcWallet ? 'border-destructive' : ''}
                                />
                                <ErrorMessage field="btcWallet" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="flex items-center gap-2" onClick={handleSave}>
                                <Save className="w-4 h-4" />
                                Save Wallets
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="documents">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">Documents & IDs</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* IDs Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Identity Documents
                                </h3>

                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Secure Storage</AlertTitle>
                                    <AlertDescription>
                                        Your IDs are stored securely and encrypted locally.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-4">
                                    <FileList files={ids} type="id" />

                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            className="hidden"
                                            id="id-upload"
                                            onChange={(e) => handleDocumentUpload(e, 'id')}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        />
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => document.getElementById('id-upload').click()}
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload ID Document
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Other Documents Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <FileIcon className="w-5 h-5" />
                                    Other Documents
                                </h3>

                                <div className="space-y-4">
                                    <FileList files={documents} type="document" />

                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            className="hidden"
                                            id="doc-upload"
                                            onChange={(e) => handleDocumentUpload(e, 'document')}
                                            accept=".pdf,.doc,.docx,.txt"
                                        />
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => document.getElementById('doc-upload').click()}
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Document
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <ScrollBar />
                </ScrollArea>
            </div>
            </Tabs>
        </div>
        <Button 
            variant="outline" 
            onClick={handleLogout}
            className="absolute top-4 right-4"
        >
            Logout
        </Button>
        </>
    );
};

export default ProfileCard;