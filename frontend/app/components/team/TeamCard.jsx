import Link from 'next/link';

const TeamCard = ({ team }) => {
    return (
        <Link href={`/teams/${team.id}`}>
            <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <h3 className="text-xl font-bold text-secondary truncate">{team.name}</h3>
                <p className="text-slate-500 mt-2">{team._count.members} Members</p>
            </div>
        </Link>
    );
};

export default TeamCard;
