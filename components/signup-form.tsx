"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FileUpload from "@/components/file-upload"
import { Eye, EyeOff, User, Mail, Phone, Briefcase, GraduationCap } from "lucide-react"

interface SignupFormProps {
  onSwitchToLogin: () => void
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [category, setCategory] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "example@email.com",
    password: "",
    confirmPassword: "",
    mobile: "",
    alternateMobile: "",
    gender: "",
    course: "",
    graduationYear: "",
    profession: "",
    passedOutYear: "",
    idCard: null as File | null,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        mobile: formData.mobile,
        alternateMobile: formData.alternateMobile,
        gender: formData.gender,
        category: category,
        ...(category === "college" && {
          course: formData.course,
          graduationYear: formData.graduationYear,
        }),
        ...(category === "alumni" && {
          profession: formData.profession,
          passedOutYear: formData.passedOutYear,
        }),
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      })

      const data = await response.json()

      if (data.success) {
        alert("Account created successfully! Please check your email for verification.")
        onSwitchToLogin()
      } else {
        if (data.error.details && data.error.details.length > 0) {
          const errorMessages = data.error.details.map((detail: any) => detail.message).join("\n")
          alert(`Registration failed:\n${errorMessages}`)
        } else {
          alert(data.error.message || "Registration failed")
        }
      }
    } catch (error) {
      console.error("Signup error:", error)
      alert("An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear + 10 - i)

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="backdrop-blur-xl bg-slate-900/40 border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl -z-10" />

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Sign Up</h1>
          <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-purple-300 border-b border-purple-500/30 pb-2">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-200 font-medium">
                  Name <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-gray-400 pr-10 focus:border-purple-400 focus:ring-purple-400/20"
                    required
                  />
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200 font-medium">
                  Email <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-gray-400 pr-10 focus:border-purple-400 focus:ring-purple-400/20"
                    required
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200 font-medium">
                  Password <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-gray-400 pr-10 focus:border-purple-400 focus:ring-purple-400/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200 font-medium">
                  Confirm Password <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-gray-400 pr-10 focus:border-purple-400 focus:ring-purple-400/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-purple-300 border-b border-purple-500/30 pb-2">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-gray-200 font-medium">
                  Mobile Number <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange("mobile", e.target.value)}
                    className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-gray-400 pr-10 focus:border-purple-400 focus:ring-purple-400/20"
                    required
                  />
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternateMobile" className="text-gray-200 font-medium">
                  Alternate Mobile Number
                </Label>
                <div className="relative">
                  <Input
                    id="alternateMobile"
                    type="tel"
                    placeholder="Enter alternate mobile number"
                    value={formData.alternateMobile}
                    onChange={(e) => handleInputChange("alternateMobile", e.target.value)}
                    className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-gray-400 pr-10 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-purple-300 border-b border-purple-500/30 pb-2">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-gray-200 font-medium">
                  Gender <span className="text-red-400">*</span>
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)} required>
                  <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white focus:border-purple-400 focus:ring-purple-400/20">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/30">
                    <SelectItem value="male" className="text-white hover:bg-purple-600/20">
                      Male
                    </SelectItem>
                    <SelectItem value="female" className="text-white hover:bg-purple-600/20">
                      Female
                    </SelectItem>
                    <SelectItem value="other" className="text-white hover:bg-purple-600/20">
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-200 font-medium">
                  Category <span className="text-red-400">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white focus:border-purple-400 focus:ring-purple-400/20">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/30">
                    <SelectItem value="college" className="text-white hover:bg-purple-600/20">
                      College
                    </SelectItem>
                    <SelectItem value="alumni" className="text-white hover:bg-purple-600/20">
                      Alumni
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Category-Specific Information */}
          {category && (
            <div className="space-y-4 transition-all duration-500 ease-in-out">
              <h2 className="text-xl font-semibold text-purple-300 border-b border-purple-500/30 pb-2">
                {category === "college" ? "College Information" : "Alumni Information"}
              </h2>

              {category === "college" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="course" className="text-gray-200 font-medium">
                        Course <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="course"
                          type="text"
                          placeholder="Enter your course"
                          value={formData.course}
                          onChange={(e) => handleInputChange("course", e.target.value)}
                          className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-gray-400 pr-10 focus:border-purple-400 focus:ring-purple-400/20"
                          required
                        />
                        <GraduationCap className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="graduationYear" className="text-gray-200 font-medium">
                        Year of Graduation <span className="text-red-400">*</span>
                      </Label>
                      <Select
                        value={formData.graduationYear}
                        onValueChange={(value) => handleInputChange("graduationYear", value)}
                        required
                      >
                        <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white focus:border-purple-400 focus:ring-purple-400/20">
                          <SelectValue placeholder="Select graduation year" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-purple-500/30 max-h-48">
                          {years.map((year) => (
                            <SelectItem
                              key={year}
                              value={year.toString()}
                              className="text-white hover:bg-purple-600/20"
                            >
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-200 font-medium">
                      ID Card Photo <span className="text-red-400">*</span>
                    </Label>
                    <FileUpload
                      onFileSelect={(file) => setFormData((prev) => ({ ...prev, idCard: file }))}
                      accept=".jpg,.jpeg,.png"
                      maxSize={5 * 1024 * 1024} // 5MB
                    />
                  </div>
                </div>
              )}

              {category === "alumni" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profession" className="text-gray-200 font-medium">
                      Profession <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="profession"
                        type="text"
                        placeholder="Enter your profession"
                        value={formData.profession}
                        onChange={(e) => handleInputChange("profession", e.target.value)}
                        className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-gray-400 pr-10 focus:border-purple-400 focus:ring-purple-400/20"
                        required
                      />
                      <Briefcase className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passedOutYear" className="text-gray-200 font-medium">
                      Year Passed Out <span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={formData.passedOutYear}
                      onValueChange={(value) => handleInputChange("passedOutYear", value)}
                      required
                    >
                      <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white focus:border-purple-400 focus:ring-purple-400/20">
                        <SelectValue placeholder="Select year passed out" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-500/30 max-h-48">
                        {years.reverse().map((year) => (
                          <SelectItem key={year} value={year.toString()} className="text-white hover:bg-purple-600/20">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Creating Account...
                </div>
              ) : (
                "Sign Up"
              )}
            </Button>
          </div>

          {/* Switch to Login */}
          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-purple-300 hover:text-purple-200 transition-colors"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
