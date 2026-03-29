-- Allow admin to delete profiles
CREATE POLICY "Admin can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow barbers to delete own income
CREATE POLICY "Barbers can delete own income"
ON public.income
FOR DELETE
TO authenticated
USING (barber_id = auth.uid());

-- Allow barbers to update own income
CREATE POLICY "Barbers can update own income"
ON public.income
FOR UPDATE
TO authenticated
USING (barber_id = auth.uid());