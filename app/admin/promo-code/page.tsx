"use client";

import { useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { FaTrashCan, FaPlus } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { useFetchPromoCodes } from "@/app/queries/admin/fetch-promo-codes";
import { useDeletePromoCode } from "@/app/queries/admin/delete-promo-code";
import { useUpdatePromoCode } from "@/app/queries/admin/update-promo-code";
import Loader from "@/components/ui/loader";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const Page = () => {
  const { data: promoCodes, isPending } = useFetchPromoCodes();
  const { mutate: deletePromoCode, isPending: isDeletePending } = useDeletePromoCode();
  const { mutate: updatePromoCode, isPending: isUpdatePending } = useUpdatePromoCode();

  const [selectedPromo, setSelectedPromo] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    couponCode: "",
    discount: 0,
  });

  const { couponCode, discount } = formData;

  const handleEditClick = (code: any) => {
    setSelectedPromo(code);
    setFormData({
      couponCode: code.code,
      discount: code.discount,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "discount" ? Number(value) : value,
    }));
  };

  const handleUpdate = () => {
    if (!selectedPromo) return;

    updatePromoCode({
      couponId: selectedPromo.id,
      stripeCouponId: selectedPromo.stripeCouponId,
      code: couponCode,
      discount,
    });

    setSelectedPromo(null);
  };

  if (isPending) return <Loader />;

  return (
    <section className="w-screen md:w-full min-h-screen bg-[#FFFFF5] relative">
      <div className="w-full mx-auto py-8 md:px-8 px-4">

        {/* Header */}
        <div className="flex md:flex-row flex-col md:items-center items-start md:justify-between justify-start md:gap-0 gap-4">
          <div className="flex items-center gap-1">
            <Link
              href="/admin/dashboard"
              className="rounded-full hover:bg-[#2f1107] hover:text-white flex items-center justify-center p-2 transition-colors duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-left"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </Link>
            <h3 className="text-2xl md:text-3xl font-bold">
              All Promo Codes
            </h3>
          </div>

          <Link
            href="/admin/add-promo-code"
            className="bg-[#ffd100] text-[#2f1107] rounded-md transition-colors duration-300 p-2 text-sm font-semibold border border-[#2f1107] flex items-center gap-2 hover:bg-[#2f1107] hover:text-[#ffd100]"
          >
            <FaPlus />
            Add Promo Code
          </Link>
        </div>

        {/* Table */}
        {promoCodes?.length === 0 ? (
          <h3 className="text-xl font-semibold text-center mt-5">
            No Promo Codes Available
          </h3>
        ) : (
          <div className="w-full mt-10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No</TableHead>
                  <TableHead>Coupon Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {promoCodes?.map((code: any, index: number) => {
                  const formattedDate = format(
                    parseISO(code.createdAt),
                    "EEEE, MMM do h:mm a"
                  );

                  return (
                    <TableRow key={code.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="uppercase">
                        {code.code}
                      </TableCell>
                      <TableCell>{code.discount}%</TableCell>
                      <TableCell>{formattedDate}</TableCell>
                      <TableCell className="flex gap-2">

                        {/* Edit Button */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              onClick={() => handleEditClick(code)}
                              className="bg-green-500 p-2 rounded-md cursor-pointer text-white hover:bg-green-600"
                            >
                              <FaEdit size={14} />
                            </button>
                          </DialogTrigger>

                          {selectedPromo && (
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Update Coupon Details
                                </DialogTitle>
                                <DialogDescription>
                                  Modify the coupon code or discount percentage.
                                  Changes will apply to future transactions.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="flex flex-col gap-3">
                                <div>
                                  <Label>Coupon Code</Label>
                                  <input
                                    name="couponCode"
                                    type="text"
                                    value={couponCode}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded-md"
                                  />
                                </div>

                                <div>
                                  <Label>Discount (%)</Label>
                                  <input
                                    name="discount"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={discount}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded-md"
                                  />
                                </div>
                              </div>

                              <DialogFooter>
                                <DialogClose className="bg-gray-500 cursor-pointer text-white p-2 rounded-md">
                                  Cancel
                                </DialogClose>

                                <button
                                  onClick={handleUpdate}
                                  disabled={isUpdatePending}
                                  className="bg-green-600 text-white cursor-pointer p-2 rounded-md hover:bg-green-800"
                                >
                                  {isUpdatePending
                                    ? "Updating..."
                                    : "Update"}
                                </button>
                              </DialogFooter>
                            </DialogContent>
                          )}
                        </Dialog>

                        {/* Delete Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="bg-red-500 p-2 cursor-pointer rounded-md text-white hover:bg-red-600">
                              <FaTrashCan size={14} />
                            </button>
                          </DialogTrigger>

                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Are you absolutely sure?
                              </DialogTitle>
                              <DialogDescription>
                                This action is permanent. The coupon will be removed
                                from the system and disabled for future payments.
                              </DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                              <DialogClose className="bg-gray-500 cursor-pointer text-white p-2 rounded-md">
                                Cancel
                              </DialogClose>

                              <button
                                onClick={() =>
                                  deletePromoCode({
                                    id: code.id,
                                    stripeCouponId: code.stripeCouponId,
                                  })
                                }
                                disabled={isDeletePending}
                                className="bg-red-600 text-white cursor-pointer p-2 rounded-md hover:bg-red-800"
                              >
                                {isDeletePending
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Page;
