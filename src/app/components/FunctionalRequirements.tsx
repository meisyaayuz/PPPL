import tableImage from "figma:asset/cb8ed7cae126987804f5717af452b1805c4a39dd.png";

export function FunctionalRequirements() {
  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Kebutuhan Fungsional</h2>
      <div className="overflow-x-auto">
        <img 
          src={tableImage} 
          alt="Tabel Kebutuhan Fungsional" 
          className="w-full"
        />
      </div>
    </div>
  );
}
