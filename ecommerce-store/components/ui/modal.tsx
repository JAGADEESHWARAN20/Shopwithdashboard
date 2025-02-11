"use client"

import { Transition, Dialog, TransitionChild, DialogPanel } from "@headlessui/react";
import { Fragment } from "react";
import IconButton from "./icon-button";
import { X } from "lucide-react";

interface ModalProps {
     open: boolean;
     onClose: () => void;
     children: React.ReactNode;
};

const Model: React.FC<ModalProps> = ({ open, onClose, children }) => {
     return (
          <Transition show={open} appear as={Fragment}>
               <Dialog as="div" className={`relative z-10`} onClose={onClose}>
                    <div className="fixed inset-0 bg-black bg-opacity-50" />
                    <div className="fixed inset-0 overflow-y-auto">
                         <div className="flex min-h-full items-center justify-center p-4 text-center">
                              <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                   <DialogPanel className={'overflow-hidden rounded-lg text-left w-full max-w-3xl align-middle'}>
                                        <div className="relative flex w-full items-center overflow-hidden bg-white px-4 pb-8 pt-14 shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
                                             <div className="absolute top-4 right-4">
                                                  <IconButton className="" icon={<X size={15} onClick={onClose} />}></IconButton>
                                             </div>
                                             {children}
                                        </div>
                                   </DialogPanel>
                              </TransitionChild>
                         </div>
                    </div>
               </Dialog>
          </Transition>
     )
}

export default Model;