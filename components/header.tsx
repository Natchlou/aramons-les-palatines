export default function Header({title, description}: {title: string, description?: string}){
    return <div className="w-full p-8 bg-primary text-white">
        <h1 className="text-3xl">{title}</h1>
        {description && <h2 className="text-sm text-muted">{description}</h2>}
    </div>
}