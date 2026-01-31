
export default function Footer() {
  return (
    <footer className="border-t py-12 w-full">
      <div className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Meetsy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
