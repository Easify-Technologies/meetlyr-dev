import axios, { AxiosError } from "axios";

export async function addUser(data: any) {
  try {
    const formData = new FormData();

    // Append all fields
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("gender", data.gender);
    formData.append("dateOfBirth", data.dateOfBirth);
    formData.append("cafe_id", data.cafe_id);
    formData.append("city_id", data.city_id);
    formData.append("oneLiner", data.oneLiner);
    formData.append("connectionStyle", data.connectionStyle);
    formData.append("communicationStyle", data.communicationStyle);
    formData.append("socialStyle", data.socialStyle);
    formData.append("healthFitnessStyle", data.healthFitnessStyle);
    formData.append("family", data.family);
    formData.append("spirituality", data.spirituality);
    formData.append("politicsNews", data.politicsNews);
    formData.append("humor", data.humor);
    formData.append("password", data.password);
    formData.append("avatar", data.avatar);

    // ✅ Convert array to JSON string
    formData.append("peopleType", JSON.stringify(data.peopleType));

    // 🚀 Send multipart/form-data request
    const response = await axios.post("/api/auth/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 201) {
      sessionStorage.setItem("email", data.email);
      sessionStorage.setItem("password", data.password);

      window.location.href = "/verify-otp";
    }

    return response.data;
  } catch (error) {
    const backendError = (error as AxiosError<any>)?.response?.data?.error;
    throw new Error(backendError || "Registration failed");
  }
}
